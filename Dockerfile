# For automated builds, we combine the UI and the API together into a
# multi-stage build that has all required assets

# Client app build
FROM node:12-alpine

ENV PATH ./node_modules/.bin:$PATH

WORKDIR /ui
ADD ./ui/package.json ./ui/package-lock.json /ui/
RUN npm install
ENV PUBLIC_URL=/static/

ADD ./ui /ui
RUN npm run build

# API
FROM python:3.6-alpine3.7

WORKDIR /tmp
ADD ./api/reqs.pip /tmp
ENV LIBRARY_PATH=/lib:/usr/lib

RUN apk add --update --no-cache dumb-init build-base python-dev jpeg-dev zlib-dev && \
    pip install -r reqs.pip && \
    apk del build-base python-dev && \
    rm -rf /var/cache/apk/*

COPY ./api /src
WORKDIR /src
COPY --from=0 /ui/build ./app-build

RUN ./manage.py collectstatic --no-input

CMD ["dumb-init", "sh", "./run.sh"]
