# Multi-Stage Production Dockerfile for Aura Fitness App

# Stage 1: Build Client Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Server Backend
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Lean Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --only=production

WORKDIR /app
COPY package*.json ./
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Create persistent data and uploads directories
RUN mkdir -p /app/data /app/uploads

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
