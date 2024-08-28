FROM node:20

WORKDIR /usr/src/app

COPY server.js ./
COPY package*.json ./
RUN npm ci

ARG PORT
EXPOSE $PORT
CMD ["node", "server.js"]