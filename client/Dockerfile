FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock
RUN yarn install --frozen --only=production
COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 5173

CMD ["yarn", "start"]
