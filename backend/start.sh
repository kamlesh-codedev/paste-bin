#!/bin/sh

set -e

echo "Running database migrations..."
flask --app run.py db upgrade

echo "Starting PasteVault production server..."
exec gunicorn --bind 0.0.0.0:${PORT:-5000} run:app