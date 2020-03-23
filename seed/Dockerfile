FROM node:lts-alpine

WORKDIR /seed

COPY seed seed
COPY api api

RUN cd api && yarn install --frozen-lockfile

CMD ["node", "seed/cli/restore"]
