# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @antigravity/web build

# --- Production Stage ---
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/package.json .
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
