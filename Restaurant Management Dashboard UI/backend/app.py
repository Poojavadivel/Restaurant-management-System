from __future__ import annotations

import os
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .db import db
from .routes.auth import auth_bp
from .routes.chat import chat_bp
from .routes.feedback import feedback_bp
from .routes.health import health_bp
from .routes.menu import menu_bp
from .routes.notifications import notifications_bp
from .routes.offers import offers_bp
from .routes.orders import orders_bp
from .routes.queue import queue_bp
from .routes.reservations import reservations_bp


def _default_sqlite_url() -> str:
    db_file = Path(__file__).resolve().parent / "restaurant.db"
    # On Windows, SQLAlchemy expects an absolute path like: sqlite:///C:/.../restaurant.db
    return f"sqlite:///{db_file.as_posix()}"


def create_app() -> Flask:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)

    app = Flask(__name__)

    api_prefix = os.getenv("API_PREFIX", "/api").rstrip("/")
    database_url = os.getenv("DATABASE_URL", _default_sqlite_url())
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    cors_origins = os.getenv("CORS_ORIGINS", "*")
    origins = "*" if cors_origins.strip() == "*" else [o.strip() for o in cors_origins.split(",") if o.strip()]
    CORS(app, resources={rf"{api_prefix}/*": {"origins": origins}})

    db.init_app(app)

    # Ensure tables exist (prevents 'no such table' on first run).
    with app.app_context():
        # Import models so SQLAlchemy is aware of all tables.
        from . import models  # noqa: F401

        db.create_all()

    # Blueprints
    app.register_blueprint(health_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(menu_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(offers_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(orders_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(reservations_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(queue_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(notifications_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(chat_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(auth_bp, url_prefix=f"{api_prefix}")
    app.register_blueprint(feedback_bp, url_prefix=f"{api_prefix}")

    @app.get("/")
    def root():
        return {
            "name": "Restaurant Management Dashboard API",
            "status": "ok",
            "time": datetime.utcnow().isoformat() + "Z",
            "apiPrefix": api_prefix,
        }

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
