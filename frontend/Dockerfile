FROM node:lts-alpine

ARG GITHUB_RUN_NUMBER

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV=production
RUN npm ci --omit=dev

RUN npm run build
RUN npm exec -- redoc-cli bundle public/docs/api/latest.yml -o dist/docs/api/redoc.html
CMD [ "npm", "run", "copy-to-mount-point" ]
