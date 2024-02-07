FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock
RUN yarn install --frozen
COPY . .

EXPOSE 5173

CMD ["yarn", "dev"]
