from __future__ import annotations

from datetime import datetime

from flask import Blueprint, request

from ..db import db
from ..models import QueueEntry
from ..utils import get_json, json_response


queue_bp = Blueprint("queue", __name__)


def serialize_entry(e: QueueEntry) -> dict:
    return {
        "id": e.id,
        "name": e.name,
        "guests": e.guests,
        "notificationMethod": e.notification_method,
        "contact": e.contact,
        "hall": e.hall,
        "segment": e.segment,
        "position": e.position,
        "estimatedWaitMinutes": e.estimated_wait_minutes,
        "joinedAt": e.joined_at.isoformat(),
        "queueDate": e.queue_date,
        "notifiedAt5Min": bool(e.notified_at_5_min),
    }


@queue_bp.get("/queue")
def list_queue():
    date = request.args.get("queueDate")
    q = QueueEntry.query
    if date:
        q = q.filter(QueueEntry.queue_date == date)
    rows = q.order_by(QueueEntry.queue_date.desc(), QueueEntry.hall.asc(), QueueEntry.segment.asc(), QueueEntry.position.asc()).all()
    return json_response({"entries": [serialize_entry(e) for e in rows]})


@queue_bp.post("/queue/join")
def join_queue():
    data = get_json(request)
    required = ["id", "name", "guests", "notificationMethod", "contact", "hall", "segment", "queueDate"]
    for k in required:
        if k not in data:
            return json_response({"error": f"{k}_required"}, 400)

    guests = int(data["guests"])
    hall = str(data["hall"])
    segment = str(data["segment"])
    queue_date = str(data["queueDate"])

    position = _next_position(queue_date, guests, hall, segment)
    estimated_wait_minutes = float(position * 60)

    entry = QueueEntry(
        id=str(data["id"]),
        name=str(data["name"]),
        guests=guests,
        notification_method=str(data["notificationMethod"]),
        contact=str(data["contact"]),
        hall=hall,
        segment=segment,
        position=position,
        estimated_wait_minutes=estimated_wait_minutes,
        joined_at=datetime.utcnow(),
        queue_date=queue_date,
        notified_at_5_min=bool(data.get("notifiedAt5Min", False)),
    )

    db.session.merge(entry)
    db.session.commit()

    return json_response(serialize_entry(entry), 201)


@queue_bp.delete("/queue/<entry_id>")
def cancel_queue(entry_id: str):
    entry = QueueEntry.query.get(entry_id)
    if not entry:
        return json_response({"error": "not_found"}, 404)

    # remove and shift positions for same combo/date
    date = entry.queue_date
    guests = entry.guests
    hall = entry.hall
    segment = entry.segment

    db.session.delete(entry)
    db.session.commit()

    _resequence(date, guests, hall, segment)

    return json_response({"ok": True})


@queue_bp.patch("/queue/<entry_id>")
def update_queue_entry(entry_id: str):
    entry = QueueEntry.query.get(entry_id)
    if not entry:
        return json_response({"error": "not_found"}, 404)

    data = get_json(request)
    if isinstance(data.get("notifiedAt5Min"), bool):
        entry.notified_at_5_min = data["notifiedAt5Min"]
    if isinstance(data.get("estimatedWaitMinutes"), (int, float)):
        entry.estimated_wait_minutes = float(data["estimatedWaitMinutes"])

    db.session.commit()
    return json_response(serialize_entry(entry))


def _next_position(queue_date: str, guests: int, hall: str, segment: str) -> int:
    count = (
        QueueEntry.query.filter(
            QueueEntry.queue_date == queue_date,
            QueueEntry.guests == guests,
            QueueEntry.hall == hall,
            QueueEntry.segment == segment,
        ).count()
    )
    return int(count) + 1


def _resequence(queue_date: str, guests: int, hall: str, segment: str) -> None:
    rows = (
        QueueEntry.query.filter(
            QueueEntry.queue_date == queue_date,
            QueueEntry.guests == guests,
            QueueEntry.hall == hall,
            QueueEntry.segment == segment,
        )
        .order_by(QueueEntry.joined_at.asc())
        .all()
    )

    for idx, row in enumerate(rows, start=1):
        row.position = idx
        row.estimated_wait_minutes = float(idx * 60)

    db.session.commit()
