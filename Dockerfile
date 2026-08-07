# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run test && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    ATHAR_DATA_DIR=/data

RUN apt-get update \
    && apt-get install -y --no-install-recommends sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 athar \
    && useradd --system --uid 1001 --gid athar athar \
    && mkdir -p /data \
    && chown -R athar:athar /data

COPY --from=builder --chown=athar:athar /app/.next/standalone ./
COPY --from=builder --chown=athar:athar /app/.next/static ./.next/static

USER athar
EXPOSE 3000

CMD ["node", "server.js"]
