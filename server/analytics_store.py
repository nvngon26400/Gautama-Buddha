"""
Lưu lượt truy cập (IP, UA, thời điểm) — SQLite, đường dẫn qua ANALYTICS_DB_PATH hoặc server/data/analytics.db.
"""

from __future__ import annotations

import os
import sqlite3
import threading
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

_LOCK = threading.Lock()

_SERVER_DIR = Path(__file__).resolve().parent


def _db_path() -> Path:
    raw = os.environ.get("ANALYTICS_DB_PATH", "").strip()
    if raw:
        return Path(raw)
    # Vercel serverless: filesystem gói deploy chỉ đọc; chỉ /tmp ghi được.
    if os.environ.get("VERCEL"):
        return Path("/tmp/analytics.db")
    return _SERVER_DIR / "data" / "analytics.db"


def _connect() -> sqlite3.Connection:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS visits (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  ts TEXT NOT NULL,
                  ip TEXT NOT NULL,
                  user_agent TEXT
                )
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_visits_ts ON visits(ts)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_visits_ip ON visits(ip)")
            conn.commit()
        finally:
            conn.close()


def record_visit(ip: str, user_agent: str | None) -> None:
    init_db()
    ts = datetime.now(timezone.utc).isoformat()
    ua = (user_agent or "")[:2000]
    ip_s = (ip or "unknown")[:128]
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                "INSERT INTO visits (ts, ip, user_agent) VALUES (?, ?, ?)",
                (ts, ip_s, ua),
            )
            conn.commit()
        finally:
            conn.close()


def _parse_ts(ts: str) -> datetime:
    s = ts.replace("Z", "+00:00")
    return datetime.fromisoformat(s)


def _rows_since(cutoff: datetime) -> list[tuple[str, str, str]]:
    init_db()
    iso = cutoff.astimezone(timezone.utc).isoformat()
    with _LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "SELECT ts, ip, user_agent FROM visits WHERE ts >= ? ORDER BY ts ASC",
                (iso,),
            )
            return [(str(r[0]), str(r[1]), str(r[2] or "")) for r in cur.fetchall()]
        finally:
            conn.close()


Granularity = str  # day | week | month | year


def _cutoff_and_buckets(g: Granularity) -> tuple[datetime, str]:
    now = datetime.now(timezone.utc)
    if g == "day":
        return now - timedelta(days=30), "30 ngày gần nhất"
    if g == "week":
        return now - timedelta(weeks=12), "12 tuần gần nhất"
    if g == "month":
        return now - timedelta(days=365), "12 tháng gần nhất"
    if g == "year":
        return now - timedelta(days=365 * 5), "5 năm gần nhất"
    return now - timedelta(days=30), "30 ngày gần nhất"


def _bucket_key(dt: datetime, g: Granularity) -> str:
    if g == "day":
        return dt.strftime("%Y-%m-%d")
    if g == "week":
        y, w, _ = dt.isocalendar()
        return f"{y}-W{w:02d}"
    if g == "month":
        return dt.strftime("%Y-%m")
    if g == "year":
        return dt.strftime("%Y")
    return dt.strftime("%Y-%m-%d")


def get_dashboard(granularity: Granularity) -> dict[str, object]:
    g = granularity if granularity in ("day", "week", "month", "year") else "day"
    cutoff, period_label = _cutoff_and_buckets(g)
    rows = _rows_since(cutoff)

    bucket_visits: dict[str, int] = defaultdict(int)
    bucket_ips: dict[str, set[str]] = defaultdict(set)
    for ts, ip, _ua in rows:
        dt = _parse_ts(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        key = _bucket_key(dt.astimezone(timezone.utc), g)
        bucket_visits[key] += 1
        bucket_ips[key].add(ip)

    bucket_list = []
    for label in sorted(bucket_visits.keys(), reverse=True):
        ips = bucket_ips[label]
        bucket_list.append(
            {
                "label": label,
                "visits": bucket_visits[label],
                "unique_ips": len(ips),
            }
        )

    all_ips = {ip for _ts, ip, _ in rows}
    totals = {"visits": len(rows), "unique_ips": len(all_ips)}

    # Top IP trong cửa sổ thống kê
    ip_counts: dict[str, int] = defaultdict(int)
    for _ts, ip, _ in rows:
        ip_counts[ip] += 1
    top_ips = sorted(ip_counts.items(), key=lambda x: (-x[1], x[0]))[:40]

    recent = []
    for ts, ip, ua in reversed(rows[-120:]):
        recent.append({"ts": ts, "ip": ip, "user_agent": ua})

    return {
        "granularity": g,
        "period_label": period_label,
        "buckets": bucket_list,
        "totals": totals,
        "recent": recent,
        "top_ips": [{"ip": ip, "visits": c} for ip, c in top_ips],
    }
