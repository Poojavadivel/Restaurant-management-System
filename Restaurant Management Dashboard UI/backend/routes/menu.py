from __future__ import annotations

import re

from flask import Blueprint, request

from ..mongo import get_menu_collection
from ..utils import json_response


menu_bp = Blueprint("menu", __name__)


def serialize_menu_item(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "name": doc.get("name"),
        "description": doc.get("description"),
        "price": doc.get("price"),
        "image": doc.get("image"),
        "isVeg": bool(doc.get("isVeg")),
        "category": doc.get("category"),
        "available": bool(doc.get("available")),
        "popular": bool(doc.get("popular")),
        "todaysSpecial": bool(doc.get("todaysSpecial")),
        "calories": doc.get("calories"),
        "prepTime": doc.get("prepTime"),
        "offer": doc.get("offer"),
    }


@menu_bp.get("/menu-items")
def list_menu_items():
    category = request.args.get("category")
    veg = request.args.get("veg")  # 'true'|'false'
    q = request.args.get("q")

    menu = get_menu_collection()
    query: dict = {}

    if category and category != "All":
        query["category"] = category
    if veg in ("true", "false"):
        query["isVeg"] = veg == "true"
    if q:
        regex = re.compile(re.escape(q), re.IGNORECASE)
        query["$or"] = [{"name": regex}, {"description": regex}]

    items = list(menu.find(query).sort([("category", 1), ("name", 1)]))
    return json_response({"items": [serialize_menu_item(i) for i in items]})


@menu_bp.get("/menu-items/<item_id>")
def get_menu_item(item_id: str):
    menu = get_menu_collection()
    item = menu.find_one({"id": item_id})
    if not item:
        return json_response({"error": "not_found"}, 404)
    return json_response(serialize_menu_item(item))


@menu_bp.get("/menu/categories")
def list_categories():
    menu = get_menu_collection()
    cats = sorted({c for c in menu.distinct("category") if c})
    return json_response({"categories": ["All", *cats]})
