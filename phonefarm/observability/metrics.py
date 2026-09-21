"""
phonefarm/observability/metrics.py — OpenTelemetry metrics for phonefarm

Metrics:
- phonefarm.account.creation_rate (counter)
- phonefarm.account.warmup_progress (gauge)
- phonefarm.device.health_status (gauge)
- phonefarm.device.fingerprint_collision (counter)
- phonefarm.antipattern.detected (counter)
- phonefarm.antipattern.by_type (counter)
"""

from typing import Dict, Any

try:
    from opentelemetry import metrics
    HAS_OTEL = True
except ImportError:
    HAS_OTEL = False


class PhonefarmMetrics:
    """OpenTelemetry metrics for phonefarm operations"""

    def __init__(self):
        if HAS_OTEL:
            meter = metrics.get_meter("autoclaw.phonefarm")
            
            # Counters
            self.account_creation_counter = meter.create_counter(
                "phonefarm.account.created",
                description="Account creation count",
                unit="1"
            )
            
            self.warmup_started_counter = meter.create_counter(
                "phonefarm.account.warmup_started",
                description="Warmup activations",
                unit="1"
            )
            
            self.warmup_completed_counter = meter.create_counter(
                "phonefarm.account.warmup_completed",
                description="Warmup completions",
                unit="1"
            )
            
            self.antipattern_detected_counter = meter.create_counter(
                "phonefarm.antipattern.detected",
                description="Anti-pattern detections",
                unit="1"
            )
            
            self.fingerprint_collision_counter = meter.create_counter(
                "phonefarm.device.fingerprint_collision",
                description="Device fingerprint collisions",
                unit="1"
            )
            
            # Gauges
            self.device_health_gauge = meter.create_observable_gauge(
                "phonefarm.device.health",
                description="Device health status",
                unit="1"
            )
            
            self.active_warmups_gauge = meter.create_observable_gauge(
                "phonefarm.account.active_warmups",
                description="Number of active warmups",
                unit="1"
            )
            
            # Histograms
            self.creation_latency_histogram = meter.create_histogram(
                "phonefarm.account.creation_latency_ms",
                description="Account creation latency",
                unit="ms"
            )
            
            self.warmup_duration_histogram = meter.create_histogram(
                "phonefarm.account.warmup_duration_days",
                description="Warmup duration",
                unit="days"
            )
        else:
            # No-op implementations
            self.account_creation_counter = None
            self.warmup_started_counter = None
            self.warmup_completed_counter = None
            self.antipattern_detected_counter = None
            self.fingerprint_collision_counter = None
            self.device_health_gauge = None
            self.active_warmups_gauge = None
            self.creation_latency_histogram = None
            self.warmup_duration_histogram = None

    def record_account_created(self, platform: str, category: str):
        """Record account creation"""
        if self.account_creation_counter:
            self.account_creation_counter.add(1, {"platform": platform, "category": category})

    def record_warmup_started(self, platform: str, duration_days: int):
        """Record warmup start"""
        if self.warmup_started_counter:
            self.warmup_started_counter.add(1, {"platform": platform})
        if self.warmup_duration_histogram:
            self.warmup_duration_histogram.record(duration_days, {"platform": platform})

    def record_warmup_completed(self, platform: str):
        """Record warmup completion"""
        if self.warmup_completed_counter:
            self.warmup_completed_counter.add(1, {"platform": platform})

    def record_antipattern_detected(self, pattern_id: str, platform: str):
        """Record anti-pattern detection"""
        if self.antipattern_detected_counter:
            self.antipattern_detected_counter.add(1, {"pattern": pattern_id, "platform": platform})

    def record_fingerprint_collision(self, platform: str, category: str):
        """Record fingerprint collision"""
        if self.fingerprint_collision_counter:
            self.fingerprint_collision_counter.add(1, {"platform": platform, "category": category})

    def record_creation_latency(self, latency_ms: float, platform: str):
        """Record account creation latency"""
        if self.creation_latency_histogram:
            self.creation_latency_histogram.record(latency_ms, {"platform": platform})


# Global metrics instance
phonefarm_metrics = PhonefarmMetrics()
