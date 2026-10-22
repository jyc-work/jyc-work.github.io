"""Deterministic Tool Loop lab. No model API or production tools are involved."""
from __future__ import annotations
from dataclasses import dataclass, field
import json
from typing import Callable

@dataclass(frozen=True)
class Call:
    call_id: str
    name: str
    args: dict

@dataclass
class Result:
    status: str
    answer: str | None
    events: list[dict] = field(default_factory=list)

class ScriptedModel:
    def __init__(self, actions: list[Call | str]):
        self.actions = iter(actions)
    def next(self, history: list[dict]) -> Call | str:
        return next(self.actions, "DONE")

class ToolHarness:
    def __init__(self, *, approved_writes=False, max_steps=5):
        if max_steps < 1: raise ValueError("max_steps must be positive")
        self.approved_writes = approved_writes
        self.max_steps = max_steps
        self.store: dict[str, str] = {}
        self.ledger: dict[str, tuple[str, str]] = {}  # NOT durable
        self.registry: dict[str, tuple[Callable, bool]] = {
            "add": (lambda a, b: a + b, False),
            "put": (self._put, True),
        }
    def _put(self, key: str, value: str) -> str:
        self.store[key] = value
        return "stored"
    @staticmethod
    def validate(call: Call) -> None:
        if call.name == "add":
            if set(call.args) != {"a", "b"} or any(type(call.args[k]) is not int for k in ("a", "b")):
                raise ValueError("add expects integer a and b")
        elif call.name == "put":
            if set(call.args) != {"key", "value"} or any(type(call.args[k]) is not str for k in ("key", "value")):
                raise ValueError("put expects string key and value")
            if not 1 <= len(call.args["key"]) <= 64: raise ValueError("invalid key length")
        else: raise ValueError("tool not allowed")
    def run(self, model: ScriptedModel) -> Result:
        events, history = [], []
        for step in range(1, self.max_steps + 1):
            action = model.next(history)
            if isinstance(action, str):
                events.append({"step": step, "event": "final"})
                return Result("done", action, events)
            if not isinstance(action, Call):
                events.append({"step": step, "event": "invalid_model_action"})
                return Result("failed", None, events)
            events.append({"step": step, "event": "tool_requested", "tool": action.name, "call_id": action.call_id})
            try:
                self.validate(action)
                function, writes = self.registry[action.name]
                if writes and not self.approved_writes:
                    raise PermissionError("write tool requires server approval")
                signature = json.dumps({"name": action.name, "args": action.args}, sort_keys=True)
                if action.call_id in self.ledger:
                    previous, output = self.ledger[action.call_id]
                    if previous != signature: raise ValueError("reused call_id with different request")
                    events.append({"step": step, "event": "deduplicated", "call_id": action.call_id})
                else:
                    output = str(function(**action.args))
                    self.ledger[action.call_id] = (signature, output)
                    events.append({"step": step, "event": "tool_succeeded", "call_id": action.call_id})
                history.append({"call_id": action.call_id, "result": output})
            except (ValueError, PermissionError, TypeError) as error:
                events.append({"step": step, "event": "tool_rejected", "call_id": action.call_id, "error": str(error)})
                history.append({"call_id": action.call_id, "error": str(error)})
        events.append({"step": self.max_steps, "event": "budget_exhausted"})
        return Result("budget_exhausted", None, events)

if __name__ == "__main__":
    harness = ToolHarness(max_steps=4)
    outcome = harness.run(ScriptedModel([Call("1", "add", {"a": 2, "b": 3}), "5"]))
    print(json.dumps({"status": outcome.status, "answer": outcome.answer, "events": outcome.events}, ensure_ascii=False, indent=2))
