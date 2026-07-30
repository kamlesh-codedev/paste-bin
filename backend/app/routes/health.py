from flask import Blueprint, jsonify

from app.extensions import db


health_bp = Blueprint(
    "health",
    __name__,
    url_prefix="/api"
)


@health_bp.get("/health")
def health_check():
    """Check application and database health."""

    try:
        db.session.execute(db.text("SELECT 1"))

        return jsonify({
            "status": "ok",
            "message": "PasteVault API is running",
            "database": "connected"
        }), 200

    except Exception:
        return jsonify({
            "status": "error",
            "message": "PasteVault API is running",
            "database": "disconnected"
        }), 503