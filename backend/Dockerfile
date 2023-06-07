FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY dist .
EXPOSE 3000
CMD [ "node", "--unhandled-rejections=strict", "app.js" ]


