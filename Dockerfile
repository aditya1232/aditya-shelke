# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# This copies everything from your root (including app.js and src/)
COPY . . 

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# IMPORTANT: This copies app.js and the src/ directory into the production image
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/src ./src

# Expose the port your app uses
EXPOSE 30001

# Start the application
CMD ["node", "app.js"]