# Drink Stash
A little web app for saving and searching for cocktail recipes.

Run it behind an HTTP reverse-proxy for TLS-termination etc. You can run it
from the base image, storing persistent data in a sqlite database in a
mounted volume:

```yaml
version: '3'

services:
    api:
        image: 'gthole/drink-stash:latest'
        restart: 'always'
        environment:
            SECRET_KEY=<yourlongsecretkey>
            ALLOWED_HOSTS=<yourhostname>
        expose:
            - '8000'
        volumes:
            - '/usr/local/var/drinks-data:/data'
```


## Development Environment
Install [Docker](https://www.docker.com/products/docker-desktop).

```
# Build the app image
$ docker-compose build api

# Create an admin user
$ docker-compose run --rm api ./manage.py createsuperuser

# Start the server
$ docker-compose up

# Run the API unit tests
$ docker-compose run --rm api ./manage.py test drinks
```
