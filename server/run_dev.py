"""Chạy API dev: đọc .env (API_PORT) rồi khởi động uvicorn — tránh WinError 10013 trên cổng 8000."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

if __name__ == "__main__":
    import uvicorn

    # Mặc định 8765: cổng 8000 trên Windows thường bị Hyper-V / dịch vụ chiếm (WinError 10013)
    port = int(os.environ.get("API_PORT", "8765"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
