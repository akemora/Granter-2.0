import asyncio
import logging
import os
import re
import json
from typing import Optional
from bs4 import BeautifulSoup
from pydantic import ValidationError

from models import GrantData, ExtractionMethod

logger = logging.getLogger(__name__)


class IAService:
    """Intelligence & Analytics Service for grant data extraction"""

    EXTRACTION_TIMEOUT_SECONDS = 10
    MAX_EXTRACTION_ATTEMPTS = 2

    def __init__(self):
        """Initialize IAService with Gemini API"""
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.model = None

        if not self.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set - will use fallback heuristic extraction only")
        else:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI model initialized successfully")
            except ImportError:
                logger.warning("google-generativeai not installed - will use fallback heuristic extraction only")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini: {str(e)} - will use fallback heuristic extraction only")

    async def extract_grant(
        self,
        html: str,
        url: str,
        source: str,
    ) -> tuple[bool, Optional[GrantData], ExtractionMethod, Optional[str]]:
        """
        Extract grant data from HTML with fallback logic.

        Flow:
        1. Try Gemini extraction (10s timeout)
        2. On timeout: Use heuristic extraction
        3. On error: Raise explicit error (never return empty)

        Args:
            html: HTML content to extract from
            url: Source URL
            source: Source name

        Returns:
            Tuple of (success, data, method_used, error_message)
        """
        logger.info(f"Starting grant extraction from {source} ({url})")

        # 1. Try primary: Gemini extraction with timeout
        if self.model and self.gemini_api_key:
            try:
                logger.debug("Attempting Gemini AI extraction...")
                data = await self._extract_with_gemini(html, url, source)
                logger.info(f"✓ Gemini extraction successful from {source}")
                return True, data, ExtractionMethod.GEMINI, None

            except asyncio.TimeoutError:
                logger.warning(
                    f"⏱ Gemini timeout after {self.EXTRACTION_TIMEOUT_SECONDS}s - falling back to heuristic"
                )

            except Exception as e:
                logger.error(f"✗ Gemini extraction failed: {str(e)} - falling back to heuristic")

        # 2. Try fallback 1: Heuristic extraction
        try:
            logger.debug("Attempting heuristic extraction...")
            data = self._heuristic_extract(html, url, source)
            if data:
                logger.info(f"✓ Heuristic extraction successful from {source}")
                return True, data, ExtractionMethod.HEURISTIC, None
        except Exception as e:
            logger.error(f"✗ Heuristic extraction failed: {str(e)}")

        # 3. Fallback 2: Explicit error (never return empty)
        error_msg = f"Failed to extract grant data from {source}. Both AI and heuristic extraction failed."
        logger.error(f"✗ All extraction methods failed for {source}: {error_msg}")
        return False, None, ExtractionMethod.HEURISTIC, error_msg

    async def _extract_with_gemini(
        self,
        html: str,
        url: str,
        source: str,
    ) -> GrantData:
        """
        Extract grant data using Gemini AI API with timeout.

        Args:
            html: HTML content
            url: Source URL
            source: Source name

        Returns:
            GrantData object with extracted information

        Raises:
            asyncio.TimeoutError: If API call exceeds timeout
            ValueError: If Gemini response is invalid
        """
        prompt = f"""
        Extract grant information from the following HTML. Return JSON with:
        - title: Grant name/title
        - description: Grant description
        - amount: Grant amount in EUR (number only, or null)
        - deadline: Application deadline (ISO 8601 date or null)

        HTML:
        {html[:5000]}

        Return ONLY valid JSON, no markdown, no extra text.
        """

        try:
            # Run with timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    self.model.generate_content,
                    prompt,
                ),
                timeout=self.EXTRACTION_TIMEOUT_SECONDS,
            )

            extracted = json.loads(response.text)

            # Validate and create GrantData
            data = GrantData(
                title=extracted.get('title', 'Unknown'),
                description=extracted.get('description', 'No description'),
                amount=extracted.get('amount'),
                deadline=extracted.get('deadline'),
                url=url,
                source=source,
                extraction_method=ExtractionMethod.GEMINI,
            )

            return data

        except asyncio.TimeoutError:
            logger.warning(f"Gemini extraction timeout after {self.EXTRACTION_TIMEOUT_SECONDS}s")
            raise

        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from Gemini: {str(e)}")

        except ValidationError as e:
            raise ValueError(f"Invalid grant data: {str(e)}")

    def _heuristic_extract(
        self,
        html: str,
        url: str,
        source: str,
    ) -> Optional[GrantData]:
        """
        Extract grant data using heuristic rules (Regex + BeautifulSoup).

        Fallback method when Gemini fails or times out.

        Args:
            html: HTML content
            url: Source URL
            source: Source name

        Returns:
            GrantData if extraction successful, None otherwise
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')

            # Remove script and style elements
            for tag in soup(['script', 'style']):
                tag.decompose()

            # Extract title: Try h1, h2, title tag
            title = None
            for selector in ['h1', 'h2', 'title']:
                tag = soup.find(selector)
                if tag:
                    title = tag.get_text(strip=True)
                    break

            if not title:
                title = 'Grant from ' + source

            # Extract description: First paragraph or text content
            description = ''
            for p_tag in soup.find_all('p'):
                text = p_tag.get_text(strip=True)
                if len(text) > 50:
                    description = text[:500]
                    break

            if not description:
                description = soup.get_text(strip=True)[:500]

            # Extract amount: Look for EUR/€ patterns
            amount = None
            text = soup.get_text()
            # Pattern: €50,000 or €50000 or 50,000 EUR or 50000 EUR
            # More specific patterns that require either currency symbol or EUR keyword
            amount_patterns = [
                r'[€$]\s*(\d{1,3}(?:[,\.]\d{3})+)',  # €50,000 or $50,000
                r'(\d{1,3}(?:[,\.]\d{3})+)\s*EUR',    # 50,000 EUR
                r'amount[:\s]+[€$]?\s*(\d+(?:[,\.]\d{3})+)',  # amount: 50,000
            ]
            for pattern in amount_patterns:
                amount_match = re.search(pattern, text, re.IGNORECASE)
                if amount_match:
                    try:
                        amount_str = amount_match.group(1).replace(',', '').replace('.', '')
                        amount = int(amount_str)
                        break
                    except (ValueError, IndexError):
                        continue

            # Extract deadline: Look for date patterns
            deadline = None
            # ISO 8601 date pattern
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
            if date_match:
                deadline = date_match.group(1)

            # Validate minimum requirements
            if len(title) < 5 or len(description) < 10:
                logger.warning(f"Heuristic extraction did not meet minimum requirements from {source}")
                return None

            # Create GrantData
            data = GrantData(
                title=title,
                description=description,
                amount=amount,
                deadline=deadline,
                url=url,
                source=source,
                extraction_method=ExtractionMethod.HEURISTIC,
            )

            return data

        except Exception as e:
            logger.error(f"Heuristic extraction failed: {str(e)}")
            return None


# Singleton instance
ia_service = IAService()
