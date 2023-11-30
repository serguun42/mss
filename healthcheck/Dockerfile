FROM node:lts-alpine

ARG TESTING

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV=production
RUN npm ci --omit=dev

CMD [ "npm", "run", "production" ]
