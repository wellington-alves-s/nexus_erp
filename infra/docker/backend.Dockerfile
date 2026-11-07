FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 3001

CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]
