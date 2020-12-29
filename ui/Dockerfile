FROM node:14.5-alpine

WORKDIR /ui
COPY package* ./
RUN npm install
COPY ./ ./
ENV PUBLIC_URL /static

CMD ["npm", "start"]
