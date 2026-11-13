FROM node:20-alpine AS base

# Install dependencies only when needed
WORKDIR /app

# Check package specifications
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Rebuild the source code only when needed
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev"]
