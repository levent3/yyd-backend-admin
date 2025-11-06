# Multi-stage build for production optimization
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Development dependencies
FROM base AS deps-dev
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY --from=deps-dev /usr/src/app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy only production dependencies
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads && \
    chown -R node:node /usr/src/app

USER node
EXPOSE 5000

# Entrypoint script for migrations
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]

# Development stage
FROM base AS development
ENV NODE_ENV=development

COPY --from=deps-dev /usr/src/app/node_modules ./node_modules
COPY . .

RUN npx prisma generate && \
    mkdir -p uploads

EXPOSE 5000
CMD ["npm", "run", "dev"]