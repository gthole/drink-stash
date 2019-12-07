# /bin/sh
set -e

# Apply any migrations before launching the listener
./manage.py migrate

# Run the application
gunicorn -w 2 --bind=0.0.0.0 wsgi:application
