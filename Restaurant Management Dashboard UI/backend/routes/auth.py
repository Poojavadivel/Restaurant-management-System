from __future__ import annotations

from typing import Any

import bcrypt
from flask import Blueprint, request

from ..mongo import get_users_collection, utc_now
from ..utils import get_json, json_response


auth_bp = Blueprint("auth", __name__)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _serialize_user(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "address": doc.get("address", ""),
        "password": "",
        "loyaltyPoints": doc.get("loyaltyPoints", 0),
        "favorites": doc.get("favorites", []),
        "membership": doc.get("membership"),
    }


def _default_membership() -> dict[str, Any]:
    return {
        "plan": "gold",
        "status": "active",
        "monthlyPrice": 299,
        "pointsBoost": 25,
        "benefits": [
            "+25% loyalty points on all orders",
            "Exclusive member-only coupons",
            "Free delivery on orders above 500",
            "Priority customer support",
        ],
        "expiryDate": "2026-06-30",
    }


@auth_bp.post("/auth/register")
def register_user():
    data = get_json(request)
    required = ["name", "email", "phone", "address", "password"]
    missing = [field for field in required if not str(data.get(field, "")).strip()]
    if missing:
        return json_response({"error": "missing_fields", "fields": missing}, 400)

    email = _normalize_email(str(data["email"]))
    users = get_users_collection()
    if users.find_one({"email": email}):
        return json_response({"error": "email_exists"}, 409)

    password = str(data["password"])
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_doc = {
        "name": str(data["name"]).strip(),
        "email": email,
        "phone": str(data["phone"]).strip(),
        "address": str(data["address"]).strip(),
        "passwordHash": password_hash,
        "loyaltyPoints": 100,
        "favorites": [],
        "membership": _default_membership(),
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }

    users.insert_one(user_doc)
    return json_response({"user": _serialize_user(user_doc)}, 201)


@auth_bp.post("/auth/login")
def login_user():
    data = get_json(request)
    email = _normalize_email(str(data.get("email", "")))
    password = str(data.get("password", ""))

    if not email or not password:
        return json_response({"error": "missing_credentials"}, 400)

    users = get_users_collection()
    user = users.find_one({"email": email})
    if not user:
        return json_response({"error": "invalid_credentials"}, 401)

    password_hash = str(user.get("passwordHash", ""))
    if not password_hash or not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
        return json_response({"error": "invalid_credentials"}, 401)

    return json_response({"user": _serialize_user(user)})


@auth_bp.patch("/users/<email>")
def update_user(email: str):
    data = get_json(request)
    users = get_users_collection()
    current_email = _normalize_email(email)

    user = users.find_one({"email": current_email})
    if not user:
        return json_response({"error": "not_found"}, 404)

    updates: dict[str, Any] = {}
    for field in ["name", "phone", "address", "favorites", "loyaltyPoints", "membership"]:
        if field in data:
            updates[field] = data[field]

    next_email = data.get("email")
    if isinstance(next_email, str) and next_email.strip():
        normalized = _normalize_email(next_email)
        if normalized != current_email:
            if users.find_one({"email": normalized}):
                return json_response({"error": "email_exists"}, 409)
            updates["email"] = normalized

    password = str(data.get("password", "")).strip()
    if password:
        updates["passwordHash"] = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    if not updates:
        return json_response({"user": _serialize_user(user)})

    updates["updatedAt"] = utc_now()
    users.update_one({"email": current_email}, {"$set": updates})
    updated = users.find_one({"email": updates.get("email", current_email)})
    return json_response({"user": _serialize_user(updated or user)})
