"""Top-level CLI entry point."""
from __future__ import annotations
import typer

app = typer.Typer(help="phonefarm control CLI", no_args_is_help=True)


@app.command()
def version() -> None:
    """Print version."""
    from phonefarm import __version__
    typer.echo(__version__)


@app.command()
def diagnose(serial: str) -> None:
    """Run full diagnostic on a device."""
    from phonefarm.device.diagnose import diagnose_device
    typer.echo(diagnose_device(serial))


@app.command()
def provision(serial: str) -> None:
    """Provision a device into the fleet."""
    from phonefarm.device.provision import provision_device
    typer.echo(provision_device(serial))


if __name__ == "__main__":
    app()
