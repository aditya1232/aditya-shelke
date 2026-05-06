# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . . 
# This copies EVERYTHING (including app.js) into /app in the builder stage

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# CRITICAL FIX: Copy everything from the builder's /app to the production's /app
COPY --from=builder /app ./

# If your file is named 'app.js' and is in the root of your repo, this will work
CMD ["node", "app.js"]