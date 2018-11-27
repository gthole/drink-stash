# For automated builds, we combine the UI and the API together into a
# multi-stage build that has all required assets

# Client app build
FROM node:8

ENV PATH ./node_modules/.bin:$PATH

WORKDIR /app
ADD ./ui /app
RUN npm install
RUN npm run compile


# API
FROM python:3.6-alpine

RUN apk add --update --no-cache dumb-init

ADD ./api/reqs.pip /tmp
WORKDIR /tmp
RUN pip install -r reqs.pip

COPY ./api /src
WORKDIR /src
COPY --from=0 /api/app-build ./app-build

RUN ./manage.py collectstatic --no-input

CMD ["dumb-init", "sh", "./run.sh"]
