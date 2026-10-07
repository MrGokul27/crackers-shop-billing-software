# Production Dockerfile for Cracker Shop Billing Software
FROM node:20-alpine AS build

WORKDIR /app

# Copy root and client configs
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build React client
RUN cd client && npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start production server
CMD ["node", "server/index.js"]
