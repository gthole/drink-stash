# /bin/sh
set -e

./manage.py migrate
./manage.py runserver 0.0.0.0:8000
