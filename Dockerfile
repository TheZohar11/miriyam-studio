FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app
RUN apk add --no-cache curl
USER node
EXPOSE 5501
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -fsS http://localhost:5501/ || exit 1
CMD ["node", "server.js"]
