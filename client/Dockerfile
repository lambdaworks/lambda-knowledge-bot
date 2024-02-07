FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 5173

CMD ["yarn", "dev"]
