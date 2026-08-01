#!/bin/sh

flask --app run.py db upgrade

exec gunicorn --bind 0.0.0.0:${PORT} run:app