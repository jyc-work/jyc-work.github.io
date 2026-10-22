"""Read two Kafka consumer-group describe snapshots; calculate offset deltas."""
from __future__ import annotations
import argparse
from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class Offset:
    committed: int
    end: int

def parse_snapshot(content: str) -> dict[tuple[str, int], Offset]:
    out = {}
    for raw in content.splitlines():
        words = raw.split()
        if len(words) >= 6 and words[2].isdigit():
            topic, p, current, end = words[1:5]  # starts with GROUP
        elif len(words) >= 5 and words[1].isdigit():
            topic, p, current, end = words[:4]  # starts with TOPIC
        else: continue
        if not (current.isdigit() and end.isdigit()): continue
        key = (topic, int(p))
        if key in out: raise ValueError(f"duplicate partition {key}")
        out[key] = Offset(int(current), int(end))
    if not out: raise ValueError("no valid partition-offset rows")
    return out

def compare(first: dict[tuple[str, int], Offset], second: dict[tuple[str, int], Offset], seconds: float) -> list[dict]:
    if seconds <= 0: raise ValueError("interval must be positive")
    if first.keys() != second.keys(): raise ValueError("partition set changed")
    rows = []
    for topic, partition in sorted(first):
        a, b = first[(topic, partition)], second[(topic, partition)]
        if b.end < a.end or b.committed < a.committed:
            raise ValueError(f"offset decreased on {topic}-{partition}")
        rows.append({
            "topic": topic, "partition": partition,
            "lag_before": a.end-a.committed, "lag_after": b.end-b.committed,
            "lag_delta": (b.end-b.committed)-(a.end-a.committed),
            "new_records_per_s": round((b.end-a.end)/seconds, 2),
            "commit_advance_per_s": round((b.committed-a.committed)/seconds, 2)})
    return rows

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--seconds", type=float, required=True)
    args = parser.parse_args()
    rows = compare(parse_snapshot(args.before.read_text()), parse_snapshot(args.after.read_text()), args.seconds)
    print("topic partition lag_before lag_after lag_delta append_rate commit_advance_rate")
    for r in rows:
        print(r["topic"],r["partition"],r["lag_before"],r["lag_after"],r["lag_delta"],r["new_records_per_s"],r["commit_advance_per_s"])

if __name__ == "__main__":
    main()
