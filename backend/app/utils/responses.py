from flask import jsonify


def error_response(
    message: str,
    status_code: int
):
    return jsonify({
        "error": message
    }), status_code


def success_response(
    message: str,
    data=None,
    status_code: int = 200
):
    response = {
        "message": message
    }

    if data is not None:
        response["data"] = data

    return jsonify(response), status_code