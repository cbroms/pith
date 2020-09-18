FROM node:latest

COPY frontend/package.json /static/package.json

RUN npm install 

COPY frontend/src /static/src

CMD [ "serve", "-s", "build", "-l", "3000"]