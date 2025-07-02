FROM node:20.11.1

WORKDIR /usr/src/app

COPY package*.json ./

# COPY .env ./

RUN npm install

COPY . .

EXPOSE 8001
EXPOSE 8055

CMD ["npm", "run", "start:prod"]