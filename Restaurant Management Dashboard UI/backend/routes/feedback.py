from __future__ import annotations

import uuid
from typing import Any

from flask import Blueprint, request

from ..mongo import get_feedback_collection, utc_now
from ..utils import get_json, json_response


feedback_bp = Blueprint("feedback", __name__)


def _serialize_feedback(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": doc.get("id"),
        "userId": doc.get("userId"),
        "orderId": doc.get("orderId"),
        "foodRatings": doc.get("foodRatings", {}),
        "likedAspects": doc.get("likedAspects", []),
        "comment": doc.get("comment"),
        "createdAt": doc.get("createdAt"),
    }


@feedback_bp.post("/feedback")
def create_feedback():
    data = get_json(request)
    required = ["userId", "orderId", "foodRatings", "likedAspects"]
    missing = [k for k in required if k not in data]
    if missing:
        return json_response({"error": "missing_fields", "fields": missing}, 400)

    user_id = str(data.get("userId", "")).strip()
    order_id = str(data.get("orderId", "")).strip()
    if not user_id or not order_id:
        return json_response({"error": "invalid_user_or_order"}, 400)

    doc = {
        "id": data.get("id") or f"fb-{uuid.uuid4().hex}",
        "userId": user_id,
        "orderId": order_id,
        "foodRatings": data.get("foodRatings", {}),
        "likedAspects": data.get("likedAspects", []),
        "comment": data.get("comment") or None,
        "createdAt": utc_now(),
    }

    feedback = get_feedback_collection()
    feedback.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)

    return json_response({"feedback": _serialize_feedback(doc)}, 201)


@feedback_bp.get("/feedback")
def list_feedback():
    user_id = request.args.get("userId")
    query = {"userId": user_id} if user_id else {}
    feedback = get_feedback_collection()
    rows = list(feedback.find(query).sort([("createdAt", -1)]))
    return json_response({"items": [_serialize_feedback(r) for r in rows]})
