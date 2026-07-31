def validate_registration_data(data):
    if not data:
        return "Request body is required"

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username:
        return "Username is required"

    if not email:
        return "Email is required"

    if not password:
        return "Password is required"

    if len(username) < 3:
        return "Username must be at least 3 characters"

    if len(username) > 64:
        return "Username must not exceed 64 characters"

    if len(password) < 8:
        return "Password must be at least 8 characters"

    if len(password) > 128:
        return "Password must not exceed 128 characters"

    if "@" not in email:
        return "Invalid email address"

    return None


def validate_paste_data(data):
    if not data:
        return "Request body is required"

    title = data.get("title")
    content = data.get("content")

    if not title:
        return "Title is required"

    if not content:
        return "Content is required"

    if len(title) > 120:
        return "Title must not exceed 120 characters"

    visibility = data.get(
        "visibility",
        "public"
    )

    if visibility not in [
        "public",
        "private"
    ]:
        return "Visibility must be public or private"

    return None