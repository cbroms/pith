# Pith API

The server-side portion of Pith. It uses [python-socketio](https://python-socketio.readthedocs.io/en/latest/index.html) running on the [uvicorn ASGI server](https://www.uvicorn.org/).

## Development

Commands are written assuming installation on Linux. More generally, here are the steps that you need to take for installation on any other operating system:

-   Install and run the database (MongoDB)
-   Install and run the message queue/task queue (Redis)
-   Install Pith API's dependencies
-   Run the development server

### Install the database

We use MongoDB as the database for Pith. It can either be installed locally or on the cloud with MongoDB Atlas. To install it locally on your machine, follow [MongoDB's instructions](https://docs.mongodb.com/manual/installation/). 

### Environtment

Add the following lines in a `.env` file to setup your connection to MongoDB and Redis.

```
MONGO_CONN=mongodb://localhost:27017/
MONGO_CONN_TEST=mongodb://localhost:27017/

# If you use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and have a connection string. 
#MONGO_CONN=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
#MONGO_CONN_TEST=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname-test>?retryWrites=true&w=majority
REDIS_IP=localhost
REDIS_PORT=6379
```

Then run `setup.sh`. This will setup your environment and create the `src/startup.sh` script.

## Testing/Developing

Run the following in `src` to begin testing and developing within your environment:
```
$ . startup.sh
$ . test.sh
$ python app.py
```
Now, the backend should be up and running locally on port 8080. You can connect from the [Pith client](https://github.com/rainflame/pith-client), which creates a websockets connection with the API.

## Deployment 

Deploying the required services is done with Docker. Build and run it:

```
$ sudo docker-compose up --build -d
$ sudo docker-compose up
```
