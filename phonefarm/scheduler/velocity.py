"""First-hour engagement velocity."""
from __future__ import annotations


def velocity(views_first_hour: int, saves: int, shares: int) -> float:
    return (views_first_hour * 0.1) + (saves * 3) + (shares * 5)
