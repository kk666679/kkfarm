"""
phonefarm/observability/tracer.py — OpenTelemetry tracing for phonefarm

Instruments:
- account.create
- account.warmup
- account.health_check
- device.detect_antipatterns
- device.rotate
- verification.prepare
"""

from typing import Optional, Any, Callable
from functools import wraps

try:
    from opentelemetry import trace
    from opentelemetry.trace import Status, StatusCode
    HAS_OTEL = True
except ImportError:
    HAS_OTEL = False


class PhonefarmTracer:
    """OpenTelemetry tracing for phonefarm operations"""

    def __init__(self):
        self.tracer = trace.get_tracer("autoclaw.phonefarm") if HAS_OTEL else None

    def span(self, name: str, **attributes):
        """Context manager for creating spans"""
        class SpanContextManager:
            def __init__(self, tracer, span_name, attrs):
                self.tracer = tracer
                self.span_name = span_name
                self.attrs = attrs
                self.span = None

            def __enter__(self):
                if self.tracer:
                    self.span = self.tracer.start_span(self.span_name)
                    for k, v in self.attrs.items():
                        if self.span:
                            self.span.set_attribute(k, v)
                return self.span

            def __exit__(self, exc_type, exc_val, exc_tb):
                if self.span:
                    if exc_type:
                        self.span.record_exception(exc_val)
                        self.span.set_status(Status(StatusCode.ERROR))
                    else:
                        self.span.set_status(Status(StatusCode.OK))
                    self.span.end()

        return SpanContextManager(self.tracer, name, attributes)

    def instrument_method(self, span_name: str = None):
        """Decorator to instrument async methods"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            async def wrapper(*args, **kwargs):
                name = span_name or f"{func.__module__}.{func.__name__}"
                with self.span(name):
                    return await func(*args, **kwargs)
            return wrapper
        return decorator

    async def trace_account_creation(
        self,
        platform: str,
        device_id: str,
        email: str,
        callback: Callable
    ):
        """Trace account creation operation"""
        with self.span(
            "phonefarm.account.create",
            platform=platform,
            device_id=device_id,
            email_hash=hash(email) % 10000  # Don't log full email
        ) as span:
            return await callback()

    async def trace_warmup(
        self,
        account_id: str,
        platform: str,
        duration_days: int,
        callback: Callable
    ):
        """Trace warmup operation"""
        with self.span(
            "phonefarm.account.warmup",
            account_id=account_id,
            platform=platform,
            duration_days=duration_days
        ) as span:
            return await callback()

    async def trace_antipattern_detection(
        self,
        device_id: str,
        platform: str,
        callback: Callable
    ):
        """Trace anti-pattern detection"""
        with self.span(
            "phonefarm.device.detect_antipatterns",
            device_id=device_id,
            platform=platform
        ) as span:
            return await callback()


# Global tracer instance
phonefarm_tracer = PhonefarmTracer()
