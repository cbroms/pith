FROM node:latest

COPY frontend/package.json /static/package.json

RUN npm install 

CMD [ "npm", "start" ]
# CMD ["ping", "localhost"]