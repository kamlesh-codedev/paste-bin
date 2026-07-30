from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

import sqlalchemy as sa
import sqlalchemy.orm as so

from app import db


class Paste(db.Model):
    __tablename__ = "pastes"

    id: so.Mapped[int] = so.mapped_column(
        primary_key=True
    )

    public_id: so.Mapped[str] = so.mapped_column(
        sa.String(36),
        unique=True,
        index=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )

    user_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("users.id"),
        index=True,
        nullable=False
    )

    title: so.Mapped[str] = so.mapped_column(
        sa.String(120),
        nullable=False
    )

    content: so.Mapped[str] = so.mapped_column(
        sa.Text,
        nullable=False
    )

    language: so.Mapped[str] = so.mapped_column(
        sa.String(64),
        nullable=False,
        default="plaintext"
    )

    visibility: so.Mapped[str] = so.mapped_column(
        sa.String(64),
        nullable=False,
        default="public"
    )

    expires_at: so.Mapped[Optional[datetime]] = so.mapped_column(
        nullable=True
    )

    created_at: so.Mapped[datetime] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: so.Mapped[datetime] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    author: so.Mapped["User"] = so.relationship(
        back_populates="pastes"
    )

    def __repr__(self) -> str:
        return f"<Paste {self.title}>"