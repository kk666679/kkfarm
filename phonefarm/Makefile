.PHONY: install test lint typecheck fmt tree

install:
	pip install -r requirements-dev.txt

test:
	pytest -q

lint:
	ruff check .

typecheck:
	mypy phonefarm

fmt:
	ruff format .

tree:
	@find . -type f -not -path './.git/*' -not -path './__pycache__/*' \
	  -not -path '*/__pycache__/*' | sort
