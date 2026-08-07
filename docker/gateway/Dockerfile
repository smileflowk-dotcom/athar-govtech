FROM node:22-bookworm-slim

WORKDIR /gateway
ENV NODE_ENV=production \
    GATEWAY_PORT=8080 \
    ATHAR_UPSTREAM_HOST=athar \
    ATHAR_UPSTREAM_PORT=3000

COPY --chown=node:node server.mjs ./server.mjs

USER node
EXPOSE 8080

CMD ["node", "server.mjs"]
