FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./ 
COPY prisma ./prisma/

# Install dependencies
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
# Skip type checking and linting for faster builds if desired, but default is fine.
# We might need to set a dummy DATABASE_URL if the build process tries to validate it, 
# though usually it's not needed for 'next build' unless pages fetch data at build time.
ENV DATABASE_URL="mysql://root:password@localhost:3306/basketball_stats"

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy prisma schema for migrations if needed at runtime
COPY --from=builder /app/prisma ./prisma

# Copy package.json just in case
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to 0.0.0.0 to allow external access
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
