# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY sql ./sql
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=staging
ENV PORT=3000
RUN addgroup -S clearit && adduser -S clearit -G clearit \
  && apk add --no-cache wget
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/sql ./sql
COPY --from=build /app/package.json ./package.json
RUN mkdir -p /app/logs && chown -R clearit:clearit /app
USER clearit
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/main.js"]
