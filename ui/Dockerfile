FROM node:8

ENV PATH ./node_modules/.bin:$PATH

WORKDIR /app
ADD ./package.json /app/package.json
RUN npm install

ENV PATH ./node_modules/.bin:$PATH
