FROM node:latest

COPY frontend/package.json /static/package.json

WORKDIR /static 

RUN npm install

COPY frontend/public /static/public

CMD [ "npm", "start" ]

