from __future__ import annotations

from flask import Blueprint, request

from ..mongo import get_orders_collection, utc_now
from ..utils import get_json, json_response


orders_bp = Blueprint("orders", __name__)


def serialize_order(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "userId": doc.get("userId"),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal"),
        "tax": doc.get("tax"),
        "loyaltyDiscount": doc.get("loyaltyDiscount"),
        "loyaltyPointsRedeemed": doc.get("loyaltyPointsRedeemed"),
        "total": doc.get("total"),
        "status": doc.get("status"),
        "type": doc.get("type"),
        "date": doc.get("date"),
        "deliveryAddress": doc.get("deliveryAddress"),
        "invoiceUrl": doc.get("invoiceUrl"),
    }


@orders_bp.get("/orders")
def list_orders():
    user_id = request.args.get("userId")
    orders = get_orders_collection()
    query = {"userId": user_id} if user_id else {}
    rows = list(orders.find(query).sort([("date", -1)]))
    return json_response({"orders": [serialize_order(o) for o in rows]})


@orders_bp.get("/orders/<order_id>")
def get_order(order_id: str):
    orders = get_orders_collection()
    o = orders.find_one({"id": order_id})
    if not o:
        return json_response({"error": "not_found"}, 404)
    return json_response(serialize_order(o))


@orders_bp.post("/orders")
def create_order():
    data = get_json(request)
    order_id = data.get("id")
    if not isinstance(order_id, str) or not order_id:
        return json_response({"error": "id_required"}, 400)

    items = data.get("items")
    if not isinstance(items, list):
        return json_response({"error": "items_required"}, 400)

    total = data.get("total")
    if not isinstance(total, (int, float)):
        return json_response({"error": "total_required"}, 400)

    doc = {
        "id": order_id,
        "userId": data.get("userId"),
        "items": items,
        "subtotal": data.get("subtotal"),
        "tax": data.get("tax"),
        "loyaltyDiscount": data.get("loyaltyDiscount"),
        "loyaltyPointsRedeemed": data.get("loyaltyPointsRedeemed"),
        "total": float(total),
        "status": data.get("status", "preparing"),
        "type": data.get("type", "dine-in"),
        "date": data.get("date"),
        "deliveryAddress": data.get("deliveryAddress"),
        "invoiceUrl": data.get("invoiceUrl"),
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }

    orders = get_orders_collection()
    orders.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)

    return json_response(serialize_order(doc), 201)


@orders_bp.patch("/orders/<order_id>")
def update_order(order_id: str):
    orders = get_orders_collection()
    existing = orders.find_one({"id": order_id})
    if not existing:
        return json_response({"error": "not_found"}, 404)

    data = get_json(request)
    updates = {}
    if isinstance(data.get("status"), str):
        updates["status"] = data["status"]
    if isinstance(data.get("invoiceUrl"), str):
        updates["invoiceUrl"] = data["invoiceUrl"]

    if updates:
        updates["updatedAt"] = utc_now()
        orders.update_one({"id": order_id}, {"$set": updates})
        existing.update(updates)

    return json_response(serialize_order(existing))
