FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=dev
# Copy ALL files from your root (where app.js lives) to the container
COPY . .

# List files during build to verify app.js is there (Check your logs for this!)
RUN ls -la /app

EXPOSE 3000

CMD ["node", "app.js"]