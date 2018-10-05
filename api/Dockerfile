FROM python:3.6-alpine

RUN apk add --update --no-cache \
    curl \
    linux-headers \
    musl-dev \
    g++ \
    gcc \
    libxslt-dev \
    libffi-dev \
    openssl-dev \
    dumb-init

ADD ./reqs.pip /tmp
WORKDIR /tmp
RUN pip install -r reqs.pip

COPY ./ /src
WORKDIR /src

# RUN ./manage.py collectstatic --no-input

CMD ["sh", "./run.sh"]
