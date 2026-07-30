from __future__ import annotations

from datetime import datetime, timezone
from typing import List

import sqlalchemy as sa
import sqlalchemy.orm as so

from app import db


class User(db.Model):
    __tablename__ = "users"

    id: so.Mapped[int] = so.mapped_column(
        primary_key=True
    )

    username: so.Mapped[str] = so.mapped_column(
        sa.String(64),
        index=True,
        unique=True,
        nullable=False
    )

    email: so.Mapped[str] = so.mapped_column(
        sa.String(120),
        index=True,
        unique=True,
        nullable=False
    )

    password_hash: so.Mapped[str] = so.mapped_column(
        sa.String(256),
        nullable=False
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

    pastes: so.Mapped[List["Paste"]] = so.relationship(
        back_populates="author",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.username}>"