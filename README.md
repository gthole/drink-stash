# Drink Stash
A little web app for saving and searching for cocktail recipes.

## Features
- Built for mobile devices
- Search for recipes with an expressive (nerdy) query engine
- Keep lists for menus or of things you love or want to try
- Track what's in your liquor cabinet so you can easily find what you can make
- Lightweight server, tidily packaged in Docker

## Running

Run it behind an HTTP reverse-proxy for TLS-termination etc. You can run it
from the base image, storing persistent data in a sqlite database in a
mounted volume.  With docker-compose:

```yaml
version: '3'

services:
    api:
        image: 'gthole/drink-stash:latest'
        restart: 'always'
        environment:
            SECRET_KEY=<yourlongsecretkey>
            ALLOWED_HOSTS=<yourhostname>
        ports:
            - '8000'
        volumes:
            - './data:/data'
```

## Provisioning
You can also provide some environment variables to the docker container to
provision an initial user and some recipes to get started with:

```
version: '3'

services:
    api:
        image: 'gthole/drink-stash:latest'
        restart: 'always'
        environment:
            SECRET_KEY=<yourlongsecretkey>
            ALLOWED_HOSTS=<yourhostname>
            DJANGO_SUPERUSER_USERNAME=<yourusername>
            DJANGO_SUPERUSER_EMAIL=<youremail>
            DJANGO_SUPERUSER_PASSWORD=changeme
            INITIAL_FIXTURES=classic-cocktails
        ports:
            - '8000'
        volumes:
            - './data:/data'
```

This will run a provisioning script on startup that creates a superuser if no
users exist, and creates initial recipes to search.


## Development Environment
Install [Docker](https://www.docker.com/products/docker-desktop).

```
# Build the app image
$ docker-compose build api

# Follow the setup instructions in the Provisioning section above

# Start the server
$ docker-compose up

# Run the API unit tests
$ docker-compose run --rm api ./manage.py test drinks
```
