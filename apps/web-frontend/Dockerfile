FROM node:20-alpine
WORKDIR /usr/src/web
RUN apk add --no-cache curl
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
