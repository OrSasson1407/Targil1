FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY index.js ./
COPY --from=client-build /app/client/dist ./client/dist
EXPOSE 3000
CMD ["node", "index.js"]
