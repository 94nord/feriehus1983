# Build stage: installs everything and builds the admin panel
FROM node:22-bookworm-slim AS build
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
# The admin build needs more memory than Node's default limit
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build && npm prune --omit=dev

# Runtime: only the finished result
FROM node:22-bookworm-slim
LABEL org.opencontainers.image.source=https://github.com/94nord/feriehus1983
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /opt/app ./
RUN mkdir -p data/db public/uploads && chown -R node:node data public/uploads
USER node
EXPOSE 1337
CMD ["node_modules/.bin/strapi", "start"]
