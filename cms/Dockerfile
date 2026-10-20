# Byggetrin: installerer alt og bygger admin-panelet
FROM node:22-bookworm-slim AS build
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
# Admin-bygningen kræver mere hukommelse end Nodes standardgrænse
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build && npm prune --omit=dev

# Runtime: kun det færdige resultat
FROM node:22-bookworm-slim
WORKDIR /opt/app
ENV NODE_ENV=production
# Admin-bygningen kræver mere hukommelse end Nodes standardgrænse
ENV NODE_OPTIONS=--max-old-space-size=2048
COPY --from=build --chown=node:node /opt/app ./
RUN mkdir -p data/db public/uploads && chown -R node:node data public/uploads
USER node
EXPOSE 1337
CMD ["node_modules/.bin/strapi", "start"]
