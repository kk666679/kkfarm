"""Structured logging."""
from __future__ import annotations
import logging
import os

LEVEL = os.getenv("PHONEFARM_LOG_LEVEL", "INFO")


def get_logger(name: str) -> logging.Logger:
    logging.basicConfig(level=LEVEL, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    return logging.getLogger(name)
