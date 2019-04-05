# /bin/sh
set -e

# Reset the database once an hour
while true; do
    ./manage.py flush --noinput
    ./manage.py migrate --noinput 2> /dev/null
    ./manage.py loaddata users classic-cocktails comments lists
    sleep 3600
done
