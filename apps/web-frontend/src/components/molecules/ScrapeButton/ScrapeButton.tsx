'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button/Button';

/**
 * ScrapeButton Component
 *
 * Task: S3-D2-2 (Sprint 3, Day 2)
 * Complexity: LOW - Simple component
 * Assigned to: HAIKU (simple UI component)
 *
 * Features:
 * - Scrape button with loading state
 * - Error handling display
 * - Success notification
 * - Progress tracking
 */

interface ScrapeButtonProps {
  sourceUrl: string;
  onScapeSuccess?: (grantCount: number) => void;
  onScrapeError?: (error: string) => void;
  className?: string;
}

export function ScrapeButton({
  sourceUrl,
  onScapeSuccess,
  onScrapeError,
  className = '',
}: ScrapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleScrape = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('granter_token')}`,
        },
        body: JSON.stringify({ url: sourceUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Scraping failed');
      }

      const data = await response.json();

      setSuccess(true);
      onScapeSuccess?.(data.grantCount);

      // Auto-dismiss success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scraping failed';
      setError(errorMessage);
      onScrapeError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleScrape}
        disabled={isLoading || !sourceUrl}
        className={`w-full transition-colors ${
          isLoading ? 'opacity-75 cursor-wait' : ''
        } ${success ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {isLoading ? (
          <>
            <svg className="inline mr-2 w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Scraping...
          </>
        ) : success ? (
          <>
            <svg className="inline mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Scraping Complete!
          </>
        ) : (
          <>
            <svg className="inline mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            Start Scraping
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
