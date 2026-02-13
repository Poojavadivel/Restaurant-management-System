from __future__ import annotations

from datetime import datetime

from flask import Blueprint


health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    return {"ok": True, "time": datetime.utcnow().isoformat() + "Z"}
