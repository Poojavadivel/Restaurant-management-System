from __future__ import annotations

from flask import Blueprint, request

from ..db import db
from ..models import Notification
from ..utils import get_json, json_response


notifications_bp = Blueprint("notifications", __name__)


def serialize_notification(n: Notification) -> dict:
    return {
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "referenceId": n.reference_id,
        "createdAt": n.created_at.isoformat(),
        "isRead": bool(n.is_read),
    }


@notifications_bp.get("/notifications")
def list_notifications():
    user_id = request.args.get("userId")
    q = Notification.query
    if user_id:
        q = q.filter((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
    rows = q.order_by(Notification.created_at.desc()).all()
    return json_response({"notifications": [serialize_notification(n) for n in rows]})


@notifications_bp.post("/notifications/mark-read")
def mark_read():
    data = get_json(request)
    nid = data.get("id")
    if not isinstance(nid, str) or not nid:
        return json_response({"error": "id_required"}, 400)

    n = Notification.query.get(nid)
    if not n:
        return json_response({"error": "not_found"}, 404)

    n.is_read = True
    db.session.commit()

    return json_response({"ok": True})


@notifications_bp.post("/notifications/mark-all-read")
def mark_all_read():
    user_id = request.args.get("userId")
    q = Notification.query
    if user_id:
        q = q.filter((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
    rows = q.all()
    for n in rows:
        n.is_read = True
    db.session.commit()
    return json_response({"ok": True})
