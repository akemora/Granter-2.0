FROM node:20-alpine as builder
WORKDIR /usr/src/web
RUN apk add --no-cache curl
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/web
RUN apk add --no-cache curl
COPY package.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/web/.next ./.next
COPY --from=builder /usr/src/web/public ./public
COPY --from=builder /usr/src/web/next.config.js ./
COPY --from=builder /usr/src/web/package.json ./

CMD ["npm", "run", "start"]
