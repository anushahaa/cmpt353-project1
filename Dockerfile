FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN mkdir -p uploads
RUN npm run prisma:generate

EXPOSE 3000

CMD sh -c "npm run prisma:push && npm run seed && npm run dev"