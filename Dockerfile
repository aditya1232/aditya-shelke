# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# This copies everything from your project root (including app.js and src/)
COPY . . 

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 1. Copy dependencies first (best practice for caching)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 2. CRITICAL: Copy the main file and the source folder explicitly
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["node", "app.js"]