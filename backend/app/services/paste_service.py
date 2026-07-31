from datetime import datetime, timezone
from typing import Optional

from app.extensions import db
from app.models.paste import Paste


def create_paste(
    user_id: int,
    title: str,
    content: str,
    language: str = "plaintext",
    visibility: str = "public",
    expires_at: Optional[datetime] = None
) -> Paste:
    """Create and save a new paste."""

    paste = Paste(
        user_id=user_id,
        title=title,
        content=content,
        language=language,
        visibility=visibility,
        expires_at=expires_at
    )

    db.session.add(paste)
    db.session.commit()

    return paste

def get_user_pastes(
    user_id: int,
    page: int = 1,
    per_page: int = 10
):
    query = (
        Paste.query
        .filter_by(user_id=user_id)
        .order_by(Paste.created_at.desc())
    )

    return query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )


def get_paste_by_public_id(public_id: str) -> Optional[Paste]:
    """Find a paste using its public ID."""

    return Paste.query.filter_by(
        public_id=public_id
    ).first()


def update_paste(
    paste: Paste,
    title: Optional[str] = None,
    content: Optional[str] = None,
    language: Optional[str] = None,
    visibility: Optional[str] = None,
    expires_at: Optional[datetime] = None
) -> Paste:
    """Update an existing paste."""

    if title is not None:
        paste.title = title

    if content is not None:
        paste.content = content

    if language is not None:
        paste.language = language

    if visibility is not None:
        paste.visibility = visibility

    if expires_at is not None:
        paste.expires_at = expires_at

    paste.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    return paste


def delete_paste(paste: Paste) -> None:
    """Delete a paste."""

    db.session.delete(paste)
    db.session.commit()