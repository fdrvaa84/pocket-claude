FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/master/package.json apps/master/
COPY apps/agent/package.json apps/agent/
COPY packages/protocol/package.json packages/protocol/
RUN npm install --workspaces --include-workspace-root

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/master/node_modules ./apps/master/node_modules
COPY --from=deps /app/apps/agent/node_modules ./apps/agent/node_modules
COPY . .
RUN npm run build -w apps/agent && cp apps/agent/dist/agent.js apps/master/public/agent.js
RUN npm run build -w apps/master

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/master/.next/standalone ./
COPY --from=builder /app/apps/master/.next/static ./apps/master/.next/static
COPY --from=builder /app/apps/master/public ./apps/master/public
COPY --from=builder /app/apps/master/server ./apps/master/server
COPY --from=builder /app/apps/master/migrations ./apps/master/migrations
EXPOSE 3100
CMD ["node", "apps/master/server.js"]
