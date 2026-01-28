"""Tests for Retry Manager with Exponential Backoff."""

import asyncio
import pytest
from services.retry_manager import (
    RetryConfig,
    RetryableException,
    retry_with_backoff,
    retry_with_backoff_sync,
)


class TestRetryConfig:
    """Test RetryConfig delay calculation."""

    def test_default_config(self):
        """Test default configuration."""
        config = RetryConfig()
        assert config.max_retries == 3
        assert config.initial_delay_ms == 1000
        assert config.max_delay_ms == 16000

    def test_exponential_backoff_progression(self):
        """Test exponential backoff progression (1s, 2s, 4s, 8s, max 16s)."""
        config = RetryConfig(jitter=False)  # Disable jitter for predictable values

        delays = [config.get_delay_ms(i) for i in range(5)]

        assert delays[0] == 1000  # 1s
        assert delays[1] == 2000  # 2s
        assert delays[2] == 4000  # 4s
        assert delays[3] == 8000  # 8s
        assert delays[4] == 16000  # Capped at max 16s

    def test_jitter_range(self):
        """Test that jitter adds randomness within ±10%."""
        config = RetryConfig(jitter=True)

        # Run multiple times to verify jitter is applied
        delays = [config.get_delay_ms(1) for _ in range(10)]

        # 2000ms ± 200ms = 1800-2200ms
        assert all(1800 <= d <= 2200 for d in delays), f'Delays out of range: {delays}'
        # At least some variation (very unlikely to get exact same value 10 times)
        assert len(set(delays)) > 1, 'No jitter variance detected'

    def test_custom_config(self):
        """Test custom configuration."""
        config = RetryConfig(
            max_retries=5,
            initial_delay_ms=500,
            max_delay_ms=8000,
            exponential_base=3.0,
            jitter=False,
        )

        assert config.max_retries == 5
        delays = [config.get_delay_ms(i) for i in range(3)]
        assert delays[0] == 500  # 500ms
        assert delays[1] == 1500  # 500 * 3 = 1500ms
        assert delays[2] == 4500  # 500 * 9 = 4500ms


class TestAsyncRetry:
    """Test async retry functionality."""

    @pytest.mark.asyncio
    async def test_success_on_first_attempt(self):
        """Test successful execution on first attempt."""
        call_count = 0

        async def successful_func():
            nonlocal call_count
            call_count += 1
            return 'success'

        result = await retry_with_backoff(successful_func)

        assert result == 'success'
        assert call_count == 1

    @pytest.mark.asyncio
    async def test_retry_on_retryable_exception(self):
        """Test retry on retryable exception."""
        call_count = 0

        async def failing_then_success():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise RetryableException('Temporary failure')
            return 'success'

        config = RetryConfig(max_retries=3, initial_delay_ms=10, jitter=False)
        result = await retry_with_backoff(
            failing_then_success,
            config=config,
        )

        assert result == 'success'
        assert call_count == 3

    @pytest.mark.asyncio
    async def test_exhaust_retries(self):
        """Test exhaustion of retry attempts."""
        call_count = 0

        async def always_fails():
            nonlocal call_count
            call_count += 1
            raise RetryableException('Always fails')

        config = RetryConfig(max_retries=2, initial_delay_ms=10, jitter=False)

        with pytest.raises(RetryableException):
            await retry_with_backoff(always_fails, config=config)

        # Should attempt: initial + 2 retries = 3 total
        assert call_count == 3

    @pytest.mark.asyncio
    async def test_non_retryable_exception_fails_immediately(self):
        """Test that non-retryable exceptions fail immediately."""
        call_count = 0

        async def non_retryable_error():
            nonlocal call_count
            call_count += 1
            raise ValueError('Non-retryable')

        config = RetryConfig(max_retries=3, initial_delay_ms=10)

        with pytest.raises(ValueError):
            await retry_with_backoff(
                non_retryable_error,
                config=config,
                retryable_exceptions=(RetryableException,),
            )

        # Should only attempt once (no retries for non-retryable)
        assert call_count == 1

    @pytest.mark.asyncio
    async def test_timeout_exception_triggers_retry(self):
        """Test that TimeoutError triggers retry."""
        call_count = 0

        async def timeout_then_success():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise TimeoutError('Request timed out')
            return 'success'

        config = RetryConfig(max_retries=3, initial_delay_ms=10, jitter=False)
        result = await retry_with_backoff(
            timeout_then_success,
            config=config,
            retryable_exceptions=(TimeoutError, RetryableException),
        )

        assert result == 'success'
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_args_and_kwargs_passed_correctly(self):
        """Test that args and kwargs are passed to function."""
        async def func_with_args(a, b, c=None):
            return f'{a}-{b}-{c}'

        result = await retry_with_backoff(func_with_args, 'x', 'y', c='z')

        assert result == 'x-y-z'


class TestSyncRetry:
    """Test synchronous retry functionality."""

    def test_success_on_first_attempt(self):
        """Test successful execution on first attempt."""
        call_count = 0

        def successful_func():
            nonlocal call_count
            call_count += 1
            return 'success'

        result = retry_with_backoff_sync(successful_func)

        assert result == 'success'
        assert call_count == 1

    def test_retry_on_retryable_exception(self):
        """Test retry on retryable exception."""
        call_count = 0

        def failing_then_success():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise RetryableException('Temporary failure')
            return 'success'

        config = RetryConfig(max_retries=3, initial_delay_ms=10, jitter=False)
        result = retry_with_backoff_sync(
            failing_then_success,
            config=config,
        )

        assert result == 'success'
        assert call_count == 3

    def test_exhaust_retries(self):
        """Test exhaustion of retry attempts."""
        call_count = 0

        def always_fails():
            nonlocal call_count
            call_count += 1
            raise RetryableException('Always fails')

        config = RetryConfig(max_retries=2, initial_delay_ms=10, jitter=False)

        with pytest.raises(RetryableException):
            retry_with_backoff_sync(always_fails, config=config)

        assert call_count == 3


class TestRetryTiming:
    """Test timing of retry delays."""

    @pytest.mark.asyncio
    async def test_retry_timing_is_reasonable(self):
        """Test that retry timing follows expected backoff."""
        import time

        call_times = []

        async def track_timing():
            call_times.append(time.time())
            if len(call_times) < 2:
                raise RetryableException('Fail once')
            return 'success'

        config = RetryConfig(
            max_retries=2,
            initial_delay_ms=50,
            jitter=False,
        )
        await retry_with_backoff(track_timing, config=config)

        # Check timing between attempts
        # Should wait ~50ms between attempt 1 and 2
        if len(call_times) >= 2:
            elapsed_ms = (call_times[1] - call_times[0]) * 1000
            # Allow ±20ms tolerance
            assert 30 <= elapsed_ms <= 70, f'Timing {elapsed_ms}ms outside range'
