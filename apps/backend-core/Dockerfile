FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl

# Copy root and workspace files
COPY package.json package-lock.json turbo.json ./
COPY apps/backend-core/package.json ./apps/backend-core/
COPY packages/ ./packages/

# Install dependencies at root (monorepo)
RUN npm install

# Copy backend source
COPY apps/backend-core/ ./apps/backend-core/

WORKDIR /app/apps/backend-core

# Build backend
RUN npm run build

CMD ["node", "dist/main.js"]
