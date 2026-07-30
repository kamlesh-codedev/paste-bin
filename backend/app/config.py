import os
from dotenv import load_dotenv


load_dotenv()


class Config:
    """Base application configuration."""

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/pastevault"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-secret-key-change-in-production"
    )

    JWT_ACCESS_TOKEN_EXPIRES = False

    JSON_SORT_KEYS = False