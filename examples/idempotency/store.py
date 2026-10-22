"""SQLite idempotency transaction lab; NOT a Spring Boot implementation."""
from __future__ import annotations
import hashlib
import json
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS requests (
    request_key TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, stored_result TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_key TEXT NOT NULL UNIQUE, value TEXT NOT NULL
);
"""

def init(database: str | Path) -> None:
    with sqlite3.connect(database) as conn:
        conn.executescript(SCHEMA)

def handle(database: str | Path, request_key: str, payload: dict[str, str], *, fail_before_commit=False) -> dict:
    if not request_key or set(payload) != {"value"} or not isinstance(payload["value"], str):
        raise ValueError("expected nonempty idempotency key and string value")
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    digest = hashlib.sha256(canonical.encode()).hexdigest()
    with sqlite3.connect(database, timeout=5, isolation_level=None) as conn:
        conn.execute("BEGIN IMMEDIATE")  # serialize SQLite writers, not portable SQL
        try:
            prior = conn.execute("SELECT payload_hash, stored_result FROM requests WHERE request_key=?", (request_key,)).fetchone()
            if prior:
                if prior[0] != digest: raise ValueError("idempotency-key conflict: payload differs")
                conn.execute("COMMIT")
                return json.loads(prior[1])
            cur = conn.execute("INSERT INTO records(request_key,value) VALUES(?,?)", (request_key,payload["value"]))
            result = {"record_id": cur.lastrowid, "value": payload["value"]}
            conn.execute("INSERT INTO requests(request_key,payload_hash,stored_result) VALUES(?,?,?)",
                         (request_key,digest,json.dumps(result)))
            if fail_before_commit: raise RuntimeError("fault injection before commit")
            conn.execute("COMMIT")
            return result
        except BaseException:
            conn.execute("ROLLBACK")
            raise

if __name__ == "__main__":
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        db = Path(tmp)/"demo.db"
        init(db)
        first = handle(db,"k-1",{"value":"example"})
        same = handle(db,"k-1",{"value":"example"})
        print(json.dumps({"first":first,"replayed":same,"same_result":first==same},ensure_ascii=False))
