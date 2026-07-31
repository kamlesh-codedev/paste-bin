from datetime import datetime

from flask import Blueprint, jsonify, request
from app.utils.responses import success_response, error_response
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required
)
from app.utils.datetime_utils import (
    is_expired,
    parse_iso_datetime
)

from app.services.paste_service import (
    create_paste,
    get_user_pastes,
    get_paste_by_public_id,
    update_paste,
    delete_paste
)
from app.utils.datetime_utils import (
    parse_iso_datetime
)


pastes_bp = Blueprint(
    "pastes",
    __name__,
    url_prefix="/api/pastes"
)

@pastes_bp.post("")
@jwt_required()
def create():
    """Create a new paste."""

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    try:
        expires_at = parse_iso_datetime(
            data.get("expires_at")
        )
    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    title = data.get("title")
    content = data.get("content")
    language = data.get("language", "plaintext")
    visibility = data.get("visibility", "public")

    try:
        expires_at = parse_iso_datetime(
            data.get("expires_at")
        )
    except ValueError as error:
        return jsonify({
            "error": str(error)
            }), 400

    if not title or not content:
        return jsonify({
            "error": "Title and content are required"
        }), 400

    if visibility not in ["public", "private"]:
        return jsonify({
            "error": "Visibility must be public or private"
        }), 400

    user_id = int(get_jwt_identity())

    paste = create_paste(
        user_id=user_id,
        title=title,
        content=content,
        language=language,
        visibility=visibility,
        expires_at=expires_at
    )

    return jsonify({
        "message": "Paste created successfully",
        "paste": {
            "public_id": paste.public_id,
            "title": paste.title,
            "content": paste.content,
            "language": paste.language,
            "visibility": paste.visibility,
            "created_at": paste.created_at.isoformat(),
            "expires_at": (
                paste.expires_at.isoformat()
                if paste.expires_at 
                else None)}
        }), 201

@pastes_bp.get("")
@jwt_required()
def list_pastes():
    """List all pastes belonging to the authenticated user."""

    user_id = int(get_jwt_identity())

    try:
        page = int(
            request.args.get("page", 1)
        )

        per_page = int(
            request.args.get("per_page", 10)
        )

    except ValueError:
        return jsonify({
            "error": "page and per_page must be integers"
        }), 400

    if page < 1:
        return jsonify({
            "error": "page must be at least 1"
        }), 400

    if per_page < 1 or per_page > 100:
        return jsonify({
            "error": "per_page must be between 1 and 100"
        }), 400

    pagination = get_user_pastes(
        user_id=user_id,
        page=page,
        per_page=per_page
    )

    return jsonify({
        "pastes": [
            {
                "public_id": paste.public_id,
                "title": paste.title,
                "language": paste.language,
                "visibility": paste.visibility,
                "created_at": paste.created_at.isoformat(),
                "updated_at": paste.updated_at.isoformat(),
                # Add this line below:
                "expires_at": paste.expires_at.isoformat() if paste.expires_at else None
            }
            for paste in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200

@pastes_bp.get("/<string:public_id>")
@jwt_required()
def get_paste(public_id):
    """Retrieve a paste owned by the authenticated user."""

    user_id = int(get_jwt_identity())

    paste = get_paste_by_public_id(public_id)

    if paste is None:
        return error_response("Paste not found", status_code=404)

    if paste.user_id != user_id:
        return jsonify({
            "error": "You do not have permission to access this paste"
        }), 403

    return jsonify({
        "paste": {
            "public_id": paste.public_id,
            "title": paste.title,
            "content": paste.content,
            "language": paste.language,
            "visibility": paste.visibility,
            "created_at": paste.created_at.isoformat(),
            "updated_at": paste.updated_at.isoformat(),
            # Add this line below:
            "expires_at": paste.expires_at.isoformat() if paste.expires_at else None
        }
    }), 200

@pastes_bp.put("/<string:public_id>")
@jwt_required()
def update(public_id):
    """Update a paste owned by the authenticated user."""

    user_id = int(get_jwt_identity())

    paste = get_paste_by_public_id(public_id)

    if paste is None:
        return jsonify({
            "error": "Paste not found"
        }), 404

    if paste.user_id != user_id:
        return jsonify({
            "error": "You do not have permission to update this paste"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    visibility = data.get("visibility")

    if visibility is not None and visibility not in [
        "public",
        "private"
    ]:
        return jsonify({
            "error": "Visibility must be public or private"
        }), 400

    try:
        expires_at = parse_iso_datetime(
        data.get("expires_at")
        )
    except ValueError as error:
        return jsonify({
        "error": str(error)
    }), 400

    paste = update_paste(
        paste=paste,
        title=data.get("title"),
        content=data.get("content"),
        language=data.get("language"),
        visibility=visibility,
        expires_at=expires_at
    )

    return jsonify({
        "message": "Paste updated successfully",
        "paste": {
            "public_id": paste.public_id,
            "title": paste.title,
            "content": paste.content,
            "language": paste.language,
            "visibility": paste.visibility,
            "updated_at": paste.updated_at.isoformat(),
            # Add this line below:
            "expires_at": paste.expires_at.isoformat() if paste.expires_at else None
        }
    }), 200

@pastes_bp.delete("/<string:public_id>")
@jwt_required()
def delete(public_id):
    """Delete a paste owned by the authenticated user."""

    user_id = int(get_jwt_identity())

    paste = get_paste_by_public_id(public_id)

    if paste is None:
        return jsonify({
            "error": "Paste not found"
        }), 404

    if paste.user_id != user_id:
        return jsonify({
            "error": "You do not have permission to delete this paste"
        }), 403

    delete_paste(paste)

    return jsonify({
        "message": "Paste deleted successfully"
    }), 200

@pastes_bp.get("/public/<string:public_id>")
def get_public_paste(public_id):
    """Retrieve a public paste without authentication."""

    paste = get_paste_by_public_id(
        public_id
    )

    if paste is None:
        return jsonify({
            "error": "Paste not found"
        }), 404

    if paste.visibility != "public":
        return jsonify({
            "error": "This paste is private"
        }), 403

    if is_expired(paste.expires_at):
        return jsonify({
            "error": "This paste has expired"
        }), 410

    return jsonify({
        "paste": {
            "public_id": paste.public_id,
            "title": paste.title,
            "content": paste.content,
            "language": paste.language,
            "created_at": paste.created_at.isoformat(),
            "expires_at": (
                paste.expires_at.isoformat()
                if paste.expires_at
                else None
            )
        }
    }), 200