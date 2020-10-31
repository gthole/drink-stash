# Drink Stash
A little web app for saving and searching for cocktail recipes.

## Features

- Built for mobile devices
- Search for recipes with an expressive (nerdy) query engine
- Keep lists for menus or of things you love or want to try
- Track what's in your liquor cabinet so you can easily find what you can make
- Dark mode
- Lightweight server, tidily packaged in Docker

## Screenshots

<div style="display: flex; justify-content: space-between;">
    <img width="200px" src="https://raw.githubusercontent.com/gthole/drink-stash/master/img/home.png"/>
    <img width="200px" src="https://raw.githubusercontent.com/gthole/drink-stash/master/img/search.png"/>
    <img width="200px" src="https://raw.githubusercontent.com/gthole/drink-stash/master/img/details.png"/>
    <img width="200px" src="https://raw.githubusercontent.com/gthole/drink-stash/master/img/lists.png"/>
</div>


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
            - './public:/public'
```

The [SECRET\_KEY](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)
should be a long random string of characters, and the
[ALLOWED\_HOSTS](https://docs.djangoproject.com/en/3.0/ref/settings/#allowed-hosts)
is a comma-separated list of hostnames you plan to use to access the app.

## Settings

Drink Stash imports settings from environment variables. Values that are arrays
(e.g. `ALLOWED_HOST`) are interpreted to be a comma separated list. A limited
set of variables are currently supported.

For example:

```
EMAIL_HOST=mail.mydomain.com
EMAIL_HOST_USER=no-reply@mydomain.com
EMAIL_HOST_PASSWORD=emailpassword
DEFAULT_FROM_EMAIL=Drink Stash <no-reply@mydomain.com>
SERVER_EMAIL=no-reply@mydomain.com
TIME_ZONE=America/Los_Angeles
ALLOWED_HOSTS=drinks.mydomain.com
DEBUG=False
ADMINS=me@mydomain.com,someone@mydomain.com
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
            DJANGO_SUPERUSER_FIRST_NAME=<first>
            DJANGO_SUPERUSER_LAST_NAME=<last>
            INITIAL_FIXTURES=recipes
        ports:
            - '8000'
        volumes:
            - './data:/data'
            - './public:/public'
```

This will run a provisioning script on startup that creates a superuser if no
users exist, and creates initial recipes to search. On subsequent container
starts you can remove the `DJANGO_SUPERUSER_*` and `INITIAL_FIXTURES` variables.


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
