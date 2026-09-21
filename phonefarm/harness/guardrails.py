from dataclasses import dataclass
from typing import Any, Dict, List, Callable, Optional
import re


@dataclass
class GuardrailResult:
    passed: bool
    reason: str = ""
    modified_input: Any = None


class Guardrail:
    """Base class for guardrails."""

    def __init__(self, name: str):
        self.name = name

    def check(self, input_data: Any) -> GuardrailResult:
        raise NotImplementedError


class RegexGuardrail(Guardrail):
    """Pre-LLM deterministic regex checks."""

    def __init__(self, name: str, patterns: List[str], action: str = "block"):
        super().__init__(name)
        self.patterns = [re.compile(p) for p in patterns]
        self.action = action

    def check(self, input_data: Any) -> GuardrailResult:
        text = str(input_data)
        for pattern in self.patterns:
            if pattern.search(text):
                return GuardrailResult(
                    passed=False,
                    reason=f"Pattern '{pattern.pattern}' matched in input",
                    modified_input=input_data if self.action == "allow" else None
                )
        return GuardrailResult(passed=True)


class LengthGuardrail(Guardrail):
    """Check input/output length limits."""

    def __init__(self, name: str, max_length: int, min_length: int = 0):
        super().__init__(name)
        self.max_length = max_length
        self.min_length = min_length

    def check(self, input_data: Any) -> GuardrailResult:
        length = len(str(input_data))
        if length > self.max_length:
            return GuardrailResult(
                passed=False,
                reason=f"Input length {length} exceeds maximum {self.max_length}"
            )
        if length < self.min_length:
            return GuardrailResult(
                passed=False,
                reason=f"Input length {length} below minimum {self.min_length}"
            )
        return GuardrailResult(passed=True)


class KeywordGuardrail(Guardrail):
    """Check for required/forbidden keywords."""

    def __init__(
        self,
        name: str,
        required: List[str] = None,
        forbidden: List[str] = None
    ):
        super().__init__(name)
        self.required = [k.lower() for k in (required or [])]
        self.forbidden = [k.lower() for k in (forbidden or [])]

    def check(self, input_data: Any) -> GuardrailResult:
        text = str(input_data).lower()

        for keyword in self.required:
            if keyword not in text:
                return GuardrailResult(
                    passed=False,
                    reason=f"Required keyword '{keyword}' missing"
                )

        for keyword in self.forbidden:
            if keyword in text:
                return GuardrailResult(
                    passed=False,
                    reason=f"Forbidden keyword '{keyword}' found"
                )

        return GuardrailResult(passed=True)


class CustomGuardrail(Guardrail):
    """Custom function-based guardrail."""

    def __init__(self, name: str, check_fn: Callable[[Any], GuardrailResult]):
        super().__init__(name)
        self.check_fn = check_fn

    def check(self, input_data: Any) -> GuardrailResult:
        return self.check_fn(input_data)


class GuardrailManager:
    """Manages multiple guardrails."""

    def __init__(self):
        self.guardrails: List[Guardrail] = []
        self.pre_llm: List[Guardrail] = []
        self.post_llm: List[Guardrail] = []

    def add(self, guardrail: Guardrail, stage: str = "pre") -> None:
        self.guardrails.append(guardrail)
        if stage == "pre":
            self.pre_llm.append(guardrail)
        elif stage == "post":
            self.post_llm.append(guardrail)

    def check_pre(self, input_data: Any) -> GuardrailResult:
        for guardrail in self.pre_llm:
            result = guardrail.check(input_data)
            if not result.passed:
                return result
        return GuardrailResult(passed=True)

    def check_post(self, output_data: Any) -> GuardrailResult:
        for guardrail in self.post_llm:
            result = guardrail.check(output_data)
            if not result.passed:
                return result
        return GuardrailResult(passed=True)

    def check_all(self, input_data: Any) -> List[GuardrailResult]:
        return [g.check(input_data) for g in self.guardrails]


def create_default_guardrails() -> GuardrailManager:
    """Create default guardrails for phonefarm."""
    manager = GuardrailManager()

    manager.add(
        RegexGuardrail("no_pii", [r"\b\d{3}-\d{2}-\d{4}\b", r"\b\d{10}\b"]),
        stage="pre"
    )

    manager.add(
        KeywordGuardrail(
            "no_dangerous",
            forbidden=["rm -rf", "sudo", "DELETE FROM", "DROP TABLE"]
        ),
        stage="pre"
    )

    manager.add(
        LengthGuardrail("input_length", max_length=50000),
        stage="pre"
    )

    manager.add(
        LengthGuardrail("output_length", max_length=100000),
        stage="post"
    )

    return manager