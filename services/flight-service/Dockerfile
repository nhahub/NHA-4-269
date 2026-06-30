FROM node:22-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=8081
EXPOSE 8081

# Basic container healthcheck hitting the service's own endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8081/health || exit 1

CMD ["node", "src/index.js"]
