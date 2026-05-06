# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm ci
RUN npm install pm2 -g

# Copy the rest of your code (src, app.js, etc.)
COPY . .

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=dev

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Use '.' to copy everything (including app.js and src) from the builder's /app folder
COPY --from=builder /app .

# Security: Don't run as root
USER node

EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
# CMD ["pm2-runtime", "npm", "--", "run", "dev"]