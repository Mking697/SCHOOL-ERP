# Multi-stage build for small production image
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# IMPORTANT: this is the product-wide license signing secret -- the SAME
# value must be used by every customer install built from this image AND by
# scripts/generate-license.mjs when the vendor mints license keys. It is NOT
# per-install random (unlike JWT_SECRET/DB password in install.ps1) on
# purpose: a license key signed with one secret must verify against that
# same secret on every customer's server. Before distributing this product
# to real customers, replace the placeholder below with one real random
# secret (e.g. `openssl rand -hex 32`), rebuild the image ONCE, and keep
# that same secret privately to run generate-license.mjs. Never let a
# customer's install.ps1 overwrite this value.
ENV LICENSE_SIGNING_SECRET="REPLACE_BEFORE_SHIPPING_TO_CUSTOMERS_vendor_master_license_secret"
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
EXPOSE 3000
CMD ["node", "server.js"]
