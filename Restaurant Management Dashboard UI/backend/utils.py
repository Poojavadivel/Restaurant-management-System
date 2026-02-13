from __future__ import annotations

import json
from typing import Any

from flask import Request


def json_response(obj: Any, status: int = 200):
    return obj, status


def get_json(request: Request) -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def dumps_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def loads_json(raw: str, default: Any):
    try:
        return json.loads(raw)
    except Exception:
        return default
