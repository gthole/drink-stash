# Drink Stash
A little web app for saving and searching for cocktail recipes.

## Development Environment
Install [Docker](https://www.docker.com/products/docker-desktop).

```
# Build the app image
$ docker-compose build api

# Create an admin user
$ docker-compose run --rm api ./manage.py createsuperuser

# Start the server
$ docker-compose up
```
