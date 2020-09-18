FROM node:latest

COPY frontend/ /static

WORKDIR /static 

RUN npm install 

RUN npm install -g serve

# we need to have env vars stated in a file in order to have them included in the build
RUN printf "REACT_APP_BACKEND_HOST=${REACT_APP_BACKEND_HOST}\nREACT_APP_BACKEND_PORT=${REACT_APP_BACKEND_PORT}" > .env

RUN npm run build 

CMD [ "serve", "-s", "build", "-l", "3000"]