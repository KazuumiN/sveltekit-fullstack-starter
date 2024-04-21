FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
