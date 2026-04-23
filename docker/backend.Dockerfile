FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend ./
EXPOSE 3002
CMD ["npm", "run", "start"]
