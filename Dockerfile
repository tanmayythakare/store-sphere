# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Express Backend
# ==========================================
FROM node:20-alpine AS server-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server/prisma ./prisma
RUN npx prisma generate

COPY server/ ./
RUN npm run build

# ==========================================
# Stage 3: Production Runtime Environment
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy generated Prisma client from builder
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/@prisma ./node_modules/@prisma

# Copy built server code and prisma migrations
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma

# Copy built frontend assets into server public folder
COPY --from=client-builder /app/client/dist ./public

EXPOSE 5000

CMD ["node", "dist/src/server.js"]
