from __future__ import annotations

from flask import Blueprint, request

from ..models import Offer
from ..utils import json_response


offers_bp = Blueprint("offers", __name__)


def serialize_offer(o: Offer) -> dict:
    return {
        "id": o.id,
        "title": o.title,
        "type": o.type,
        "value": o.value,
        "minOrderValue": o.min_order_value,
        "requiresLoyalty": bool(o.requires_loyalty),
    }


@offers_bp.get("/offers")
def list_offers():
    offers = Offer.query.order_by(Offer.id.asc()).all()
    return json_response({"offers": [serialize_offer(o) for o in offers]})


@offers_bp.get("/offers/eligible")
def eligible_offers():
    try:
        subtotal = float(request.args.get("subtotal", "0"))
    except ValueError:
        subtotal = 0
    try:
        loyalty_points = int(request.args.get("loyaltyPoints", "0"))
    except ValueError:
        loyalty_points = 0

    order_value = max(0, subtotal)
    points = max(0, loyalty_points)

    result = []
    for offer in Offer.query.all():
        min_value = offer.min_order_value or 0
        if order_value < min_value:
            continue
        if offer.requires_loyalty and points <= 0:
            continue
        result.append(serialize_offer(offer))

    result.sort(key=lambda x: x["id"])
    return json_response({"offers": result})
