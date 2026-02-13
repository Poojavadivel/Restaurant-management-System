from __future__ import annotations

from flask import Blueprint, request

from ..models import MenuItem
from ..utils import get_json, json_response


chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat")
def chat():
    """Minimal chatbot API.

    Frontend currently has a full local rule-based chatbot.
    This endpoint is provided so the UI can be switched later.
    """

    data = get_json(request)
    message = str(data.get("message", "")).strip().lower()

    if not message:
        return json_response({"reply": "Please type a message."})

    # very small intent handling to keep behavior stable
    if "special" in message:
        specials = MenuItem.query.filter(MenuItem.todays_special.is_(True)).limit(6).all()
        return json_response(
            {
                "reply": "Here are today's specials.",
                "items": [
                    {
                        "id": i.id,
                        "name": i.name,
                        "price": i.price,
                        "image": i.image,
                        "category": i.category,
                        "isVeg": bool(i.is_veg),
                    }
                    for i in specials
                ],
            }
        )

    if "popular" in message:
        popular = MenuItem.query.filter(MenuItem.popular.is_(True)).limit(6).all()
        return json_response(
            {
                "reply": "Here are some popular items.",
                "items": [
                    {
                        "id": i.id,
                        "name": i.name,
                        "price": i.price,
                        "image": i.image,
                        "category": i.category,
                        "isVeg": bool(i.is_veg),
                    }
                    for i in popular
                ],
            }
        )

    return json_response({"reply": "I can help with menu, specials, and popular items. Try 'today specials'."})
