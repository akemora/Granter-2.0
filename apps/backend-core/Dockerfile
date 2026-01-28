FROM node:20-alpine
WORKDIR /usr/src/backend
RUN apk add --no-cache curl
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
