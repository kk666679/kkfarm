from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import time
import uuid
from contextlib import contextmanager
from functools import wraps


@dataclass
class TraceEvent:
    id: str
    trace_id: str
    span_id: str
    parent_span_id: Optional[str]
    name: str
    start_time: float
    end_time: Optional[float] = None
    duration: Optional[float] = None
    attributes: Dict[str, Any] = field(default_factory=dict)
    status: str = "ok"
    error: Optional[str] = None


class Observability:
    """Harness-level tracing and observability."""

    def __init__(self, service_name: str = "phonefarm"):
        self.service_name = service_name
        self.traces: Dict[str, List[TraceEvent]] = {}
        self.current_trace_id: Optional[str] = None
        self.current_span_id: Optional[str] = None

    def start_trace(self, name: str, attributes: Dict = None) -> str:
        trace_id = str(uuid.uuid4())
        span_id = str(uuid.uuid4())
        self.current_trace_id = trace_id
        self.current_span_id = span_id
        self.traces[trace_id] = []
        self._add_event(trace_id, span_id, None, name, attributes or {})
        return trace_id

    def start_span(self, name: str, attributes: Dict = None) -> str:
        if not self.current_trace_id:
            self.start_trace(name, attributes)
            return self.current_trace_id

        span_id = str(uuid.uuid4())
        parent_span_id = self.current_span_id
        self.current_span_id = span_id
        self._add_event(self.current_trace_id, span_id, parent_span_id, name, attributes or {})
        return span_id

    def end_span(self, status: str = "ok", error: str = None) -> None:
        if not self.current_trace_id or not self.current_span_id:
            return

        events = self.traces.get(self.current_trace_id, [])
        for event in reversed(events):
            if event.span_id == self.current_span_id and event.end_time is None:
                event.end_time = time.time()
                event.duration = event.end_time - event.start_time
                event.status = status
                event.error = error
                break

    def add_attribute(self, key: str, value: Any) -> None:
        if not self.current_trace_id or not self.current_span_id:
            return

        events = self.traces.get(self.current_trace_id, [])
        for event in reversed(events):
            if event.span_id == self.current_span_id:
                event.attributes[key] = value
                break

    def _add_event(
        self,
        trace_id: str,
        span_id: str,
        parent_span_id: Optional[str],
        name: str,
        attributes: Dict,
    ) -> None:
        event = TraceEvent(
            id=str(uuid.uuid4()),
            trace_id=trace_id,
            span_id=span_id,
            parent_span_id=parent_span_id,
            name=name,
            start_time=time.time(),
            attributes=attributes,
        )
        self.traces[trace_id].append(event)

    def get_trace(self, trace_id: str) -> List[TraceEvent]:
        return self.traces.get(trace_id, [])

    def export_json(self, trace_id: str) -> Dict:
        events = self.get_trace(trace_id)
        return {
            "trace_id": trace_id,
            "service": self.service_name,
            "spans": [
                {
                    "span_id": e.span_id,
                    "parent_span_id": e.parent_span_id,
                    "name": e.name,
                    "start_time": e.start_time,
                    "end_time": e.end_time,
                    "duration": e.duration,
                    "attributes": e.attributes,
                    "status": e.status,
                    "error": e.error,
                }
                for e in events
            ],
        }


def trace(observability: Observability = None, name: str = None):
    """Decorator for automatic tracing."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            obs = observability or get_global_observability()
            span_name = name or func.__name__
            obs.start_span(span_name, {"function": func.__name__})
            try:
                result = await func(*args, **kwargs)
                obs.end_span("ok")
                return result
            except Exception as e:
                obs.end_span("error", str(e))
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            obs = observability or get_global_observability()
            span_name = name or func.__name__
            obs.start_span(span_name, {"function": func.__name__})
            try:
                result = func(*args, **kwargs)
                obs.end_span("ok")
                return result
            except Exception as e:
                obs.end_span("error", str(e))
                raise

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    return decorator


_global_observability = None


def get_global_observability() -> Observability:
    global _global_observability
    if _global_observability is None:
        _global_observability = Observability()
    return _global_observability


def set_global_observability(obs: Observability) -> None:
    global _global_observability
    _global_observability = obs