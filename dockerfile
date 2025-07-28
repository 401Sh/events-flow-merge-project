FROM node:18-alpine

WORKDIR /app

# копирование и package.json и package-lock.json
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE ${PORT}

# CMD ["npm", "run", "start:prod"]
CMD [ "node", "dist/main.js" ]