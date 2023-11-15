FROM node:lts-alpine

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV=production
RUN npm ci --omit=optional

CMD [ "sleep", "infinity" ]
