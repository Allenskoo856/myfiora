FROM node:16-alpine

WORKDIR /usr/app/fiora

COPY packages ./packages
COPY package.json tsconfig.json yarn.lock lerna.json ./
RUN touch .env

RUN yarn install

RUN NODE_OPTIONS=--openssl-legacy-provider yarn build:web

CMD ["yarn", "start"]
