"""
Retry Manager with Exponential Backoff

Implements exponential backoff with jitter for robust API call handling.
Prevents thundering herd problem and gracefully handles temporary failures.
"""

import asyncio
import logging
import random
from typing import Callable, TypeVar, Any, Coroutine

logger = logging.getLogger(__name__)

T = TypeVar('T')


class RetryConfig:
    """Configuration for retry behavior."""

    def __init__(
        self,
        max_retries: int = 3,
        initial_delay_ms: int = 1000,
        max_delay_ms: int = 16000,
        exponential_base: float = 2.0,
        jitter: bool = True,
    ):
        """
        Initialize retry configuration.

        Args:
            max_retries: Maximum number of retry attempts (default: 3)
            initial_delay_ms: Initial delay in milliseconds (default: 1000)
            max_delay_ms: Maximum delay in milliseconds (default: 16000)
            exponential_base: Base for exponential backoff (default: 2.0)
            jitter: Whether to add random jitter (default: True)
        """
        self.max_retries = max_retries
        self.initial_delay_ms = initial_delay_ms
        self.max_delay_ms = max_delay_ms
        self.exponential_base = exponential_base
        self.jitter = jitter

    def get_delay_ms(self, attempt: int) -> int:
        """
        Calculate delay for given attempt number.

        Uses exponential backoff: delay = initial_delay * (base ^ attempt)
        Capped at max_delay. Optionally adds random jitter.

        Args:
            attempt: Attempt number (0-indexed)

        Returns:
            Delay in milliseconds
        """
        # Exponential backoff: 1000ms, 2000ms, 4000ms, 8000ms, max 16000ms
        delay_ms = int(
            self.initial_delay_ms * (self.exponential_base ** attempt)
        )
        delay_ms = min(delay_ms, self.max_delay_ms)

        # Add jitter (±10% randomness)
        if self.jitter:
            jitter_range = int(delay_ms * 0.1)
            delay_ms += random.randint(-jitter_range, jitter_range)
            delay_ms = max(0, delay_ms)  # Ensure non-negative

        return delay_ms


class RetryableException(Exception):
    """Exception that should trigger a retry."""

    pass


async def retry_with_backoff(
    func: Callable[..., Coroutine[Any, Any, T]],
    *args,
    config: RetryConfig | None = None,
    retryable_exceptions: tuple[type[Exception], ...] = (
        RetryableException,
        TimeoutError,
        ConnectionError,
    ),
    **kwargs,
) -> T:
    """
    Execute async function with exponential backoff retry.

    Args:
        func: Async function to execute
        *args: Positional arguments for func
        config: RetryConfig instance (uses default if None)
        retryable_exceptions: Exception types that trigger retry
        **kwargs: Keyword arguments for func

    Returns:
        Result from func

    Raises:
        Exception: If all retries exhausted
    """
    if config is None:
        config = RetryConfig()

    last_exception = None

    for attempt in range(config.max_retries + 1):
        try:
            logger.debug(
                f'Attempt {attempt + 1}/{config.max_retries + 1} for {func.__name__}'
            )
            return await func(*args, **kwargs)

        except retryable_exceptions as e:
            last_exception = e
            is_last_attempt = attempt == config.max_retries

            if is_last_attempt:
                logger.error(
                    f'All {config.max_retries + 1} retries exhausted for {func.__name__}: {str(e)}'
                )
                raise

            delay_ms = config.get_delay_ms(attempt)
            delay_s = delay_ms / 1000.0
            logger.warning(
                f'Retry {attempt + 1} failed for {func.__name__}: {str(e)}. '
                f'Retrying in {delay_s:.1f}s...'
            )
            await asyncio.sleep(delay_s)

        except Exception as e:
            # Non-retryable exceptions fail immediately
            logger.error(
                f'Non-retryable exception in {func.__name__}: {str(e)}'
            )
            raise

    # This should never be reached
    if last_exception:
        raise last_exception
    raise RuntimeError(f'Unexpected state in retry_with_backoff for {func.__name__}')


def retry_with_backoff_sync(
    func: Callable[..., T],
    *args,
    config: RetryConfig | None = None,
    retryable_exceptions: tuple[type[Exception], ...] = (
        RetryableException,
        TimeoutError,
        ConnectionError,
    ),
    **kwargs,
) -> T:
    """
    Execute synchronous function with exponential backoff retry.

    Args:
        func: Synchronous function to execute
        *args: Positional arguments for func
        config: RetryConfig instance (uses default if None)
        retryable_exceptions: Exception types that trigger retry
        **kwargs: Keyword arguments for func

    Returns:
        Result from func

    Raises:
        Exception: If all retries exhausted
    """
    if config is None:
        config = RetryConfig()

    last_exception = None

    for attempt in range(config.max_retries + 1):
        try:
            logger.debug(
                f'Attempt {attempt + 1}/{config.max_retries + 1} for {func.__name__}'
            )
            return func(*args, **kwargs)

        except retryable_exceptions as e:
            last_exception = e
            is_last_attempt = attempt == config.max_retries

            if is_last_attempt:
                logger.error(
                    f'All {config.max_retries + 1} retries exhausted for {func.__name__}: {str(e)}'
                )
                raise

            delay_ms = config.get_delay_ms(attempt)
            delay_s = delay_ms / 1000.0
            logger.warning(
                f'Retry {attempt + 1} failed for {func.__name__}: {str(e)}. '
                f'Retrying in {delay_s:.1f}s...'
            )
            import time
            time.sleep(delay_s)

        except Exception as e:
            # Non-retryable exceptions fail immediately
            logger.error(
                f'Non-retryable exception in {func.__name__}: {str(e)}'
            )
            raise

    # This should never be reached
    if last_exception:
        raise last_exception
    raise RuntimeError(f'Unexpected state in retry_with_backoff_sync for {func.__name__}')
