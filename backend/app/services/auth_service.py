from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db
from app.models.user import User


def create_user(username: str, email: str, password: str) -> User:
    """Create and save a new user."""

    password_hash = generate_password_hash(password)

    user = User(
        username=username,
        email=email,
        password_hash=password_hash
    )

    db.session.add(user)
    db.session.commit()

    return user


def authenticate_user(identifier: str, password: str) -> User | None:
    """Authenticate a user using username or email."""

    user = User.query.filter(
        (User.username == identifier) |
        (User.email == identifier)
    ).first()

    if user is None:
        return None

    if not check_password_hash(
        user.password_hash,
        password
    ):
        return None

    return user