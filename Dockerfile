# ─────────────────────────────
# 1) Build stage – VitePress
# ─────────────────────────────
FROM node:22-alpine AS builder

# Optional: openssl if some deps need it; you can drop this if not needed
RUN apk add --no-cache git

WORKDIR /app

# Install deps first (cache-friendly)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# Copy the rest of the project
COPY . .

# Build the VitePress site
# Adjust this if your script is called something else (e.g. "docs:build")
RUN npm run build

# ─────────────────────────────
# 2) Runtime stage – Nginx
# ─────────────────────────────
FROM nginx:alpine

# Copy built static site from VitePress
COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html

# (Optional) Custom nginx config – uncomment if you add one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
