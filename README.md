# Pith API

The server-side portion of Pith. It uses [python-socketio](https://python-socketio.readthedocs.io/en/latest/index.html) running on the [uvicorn ASGI server](https://www.uvicorn.org/).

## Development

Commands are written assuming installation on Linux. More generally, here are the steps that you need to take for installation on any other operating system:

-   Install and run the database (MongoDB)
-   Install and run the message queue/task queue (Redis)
-   Install Pith API's dependencies
-   Run the development server

### Install the database

We use MongoDB as the database for Pith. It can either be installed locally or on the cloud with MongoDB Atlas. To install it locally on your machine, follow [MongoDB's instructions](https://docs.mongodb.com/manual/installation/). Then, start it:

```
$ sudo systemctl start mongod
```

In a `.env` file in the repository root, add:

```
MONGO_CONN=mongodb://localhost:27017/'
```

Alternatively, spin up an instance in the cloud with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and get the connection string. Add it to a `.env` file under `MONGO_CONN`:

```
MONGO_CONN=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Install Redis

We use Redis for the message and job queues. Install it:

```
$ sudo apt-get install redis-server
```

Then, run it:

```
sudo systemctl start redis-server
```

In your `.env` file, add in:

```
REDIS_IP=127.0.0.1
REDIS_PORT=6379
```

### Install Pith API

This project uses Python 3.8. You probably want to create a virutal environment:

```
$ python3.8 -m venv env
$ source env/bin/activate
```

Then, install the project's dependencies:

```
$ pip install -r requirements.txt
```

### Run the development server

Run the uvicorn server:

```
$ uvicorn app:app --reload
```

Now, the server should be up and running locally on port 8000. You can connect from the [Pith client](https://github.com/rainflame/pith-client), which creates a websockets connection with the API.

Some actions are automatically executed after a certain duration, such as expiring discussions. These tasks are added to the Redis job queue and can be run with:

```
$ arq worker.WorkerSettings
```

Since the worker script and websockets server both use the same Redis server, then can be run in completely separate processes or even on different machines.

## Deployment 

Deploying the required services is done with Docker. Build and run it:

```
$ docker-compose up 
```


## Tests

To run the tests, ensure that MongoDB and Redis are both running locally. Then run the tests:

```
$ python tests.py
```
