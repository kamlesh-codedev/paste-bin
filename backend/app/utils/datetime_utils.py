from datetime import datetime, timezone


def parse_iso_datetime(
    value: str | None
):
    """Parse an ISO 8601 datetime string."""

    if not value:
        return None

    try:
        parsed_datetime = datetime.fromisoformat(
            value
        )
    except ValueError:
        raise ValueError(
            "Invalid datetime format. "
            "Use ISO 8601 format."
        )

    # If no timezone is provided,
    # assume UTC.
    if parsed_datetime.tzinfo is None:
        parsed_datetime = parsed_datetime.replace(
            tzinfo=timezone.utc
        )

    return parsed_datetime


def is_expired(
    expires_at: datetime | None
) -> bool:
    """Return True if a paste has expired."""

    if expires_at is None:
        return False

    # Force database-loaded naive datetimes to be UTC-aware
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at <= datetime.now(
        timezone.utc
    )