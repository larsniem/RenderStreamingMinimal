FROM node:16-alpine

WORKDIR /renderstreaming

COPY package*.json ./

RUN npm install --force

COPY . .
RUN npm run build

EXPOSE 80

CMD [ "npm", "run", "start", "--" , "-w" ]
