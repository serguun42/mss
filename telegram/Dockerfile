FROM node:lts-alpine

ARG TESTING

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV=production
RUN npm ci --omit=dev

RUN if [ "$TESTING" == "TESTING" ]; then npm ci --omit=optional; npm run test; fi

CMD [ "npm", "run", "production" ]
