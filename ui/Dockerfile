FROM node:8-alpine

ENV PATH ./node_modules/.bin:$PATH

WORKDIR /app
ADD ./package.json ./package-lock.json /app/
RUN npm install

ENV PATH ./node_modules/.bin:$PATH
