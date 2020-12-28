FROM node:latest

COPY frontend/package.json /static/package.json
COPY frontend/rollup.config.js /static/rollup.config.js

WORKDIR /static 

RUN npm install

CMD [ "npm", "run", "dev" ]

