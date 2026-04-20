# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @antigravity/api build

# --- Production Stage ---
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/package.json .
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 4000
WORKDIR /app/apps/api
CMD ["pnpm", "start"]
