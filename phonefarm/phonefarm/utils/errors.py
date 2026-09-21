"""Domain errors."""
from __future__ import annotations


class PhonefarmError(Exception):
    pass


class DeviceError(PhonefarmError):
    pass


class ProvisionError(PhonefarmError):
    pass
