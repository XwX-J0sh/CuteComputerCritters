FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

EXPOSE 4200
