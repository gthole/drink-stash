FROM node:12.4-alpine

WORKDIR /ui
COPY package* ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
