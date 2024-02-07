FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production //yarn install && yarn vite

COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 80

CMD ["npm", "start"]