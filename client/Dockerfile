FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock
RUN yarn install --frozen --only=production
COPY . .

EXPOSE 5173

CMD ["yarn", "run"]
