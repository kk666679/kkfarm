"""Thin CLI shim — delegates to phonefarm.cli."""
from phonefarm.cli import app

if __name__ == "__main__":
    app()
