FROM node:lts-alpine

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV=production
RUN npm ci --omit=optional

RUN npm run build
RUN npm exec -- redoc-cli bundle public/docs/api/latest.yml -o dist/docs/api/redoc.html
CMD [ "npm", "run", "copy-to-mount-point" ]
