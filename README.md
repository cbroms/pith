# Pith

This repository contains the code for running a Pith server and client interface.

There are two primary components to this project:

### Frontend

The client-side portion is a [React](https://reactjs.org/) project using [Redux](https://redux.js.org/) for state management and the [socket.io client library](https://socket.io/docs/client-api/) for interfacing with the backend. You can find the client code in the `/frontend` directory.

### Backend

The server-side portion of Pith. It uses [python-socketio](https://github.com/miguelgrinberg/python-socketio) running on the [aiohttp server](https://github.com/aio-libs/aiohttp), [Arq](https://github.com/samuelcolvin/arq) for task queues, [Redis](https://redis.io/) as a database for task and message queues, and [MongoDB](https://www.mongodb.com/) as a database for storing content. You can find it in the `/backend` directory.

## Development

We use Docker containers to facilitate development and testing. All of the services needed to run the project are defined in `docker-compose.yml`. These are:

-   `static`: serves the React client
-   `app`: the socketio interface that's used by the React client.
-   `worker`: a worker script using the [arq task queue](https://github.com/samuelcolvin/arq) for executing assorted long-term tasks such as archiving discussions when they're complete.
-   `redis`: a Redis database used by the task queue (`worker`) and as a message queue by socketio (`app`).
-   `mongo`: the MongoDB database used to store the discussion content.
-   `tests`: a container that runs the unit tests and connects to `app` to test the interface.

The containers use volumes to easily facilitate development. You can edit any code in `/backend/src` and `/frontend/src` and containers that rely on that code will automatically reload.

### Run it

If you are running on a remote machine, copy the .env.test file to a .env file. Change HOST_NAME within the .env file to the external IP address of the remote machine. Use .env instead of .env.test in the following commands. 

To run the development build:

```
$ docker-compose --env-file .env.test up --build -d
```

Once the build completes, the client can be accessed from `http://localhost:3000`. The socketio api is running at `http://localhost:8080`.

If you're using a cloud-based Redis or MongoDB database, you can set the respective environment variables in `.env` with the connection information.

```
MONGODB: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGO_NAME=<dbname>
REDIS=redis
```

#### Testing

To run the tests, connect to the `tests` container:

```
$ docker exec -it pith_tests_1 /bin/bash
```

Then, run the tests:

```
$ ./test.sh
```

## Deployment

The file `docker-compose.prod.yml` defines the services needed to run a Pith production server. It includes all the containers listed above (with the exception of the `tests` container) and adds one new one:

-   `balancer`: the [haproxy](https://www.haproxy.org/) load balancer that distributes traffic between instances of `app`.

To deploy, determine the number of instances of the interface you'd like to run. In `haproxy.cfg`, add additional servers as needed:

```
server app01 127.0.0.1:5000 check cookie app01
server app02 127.0.0.1:5001 check cookie app02
# add more here as needed
```

In `docker-compose.prod.yml`, adjust the port range of the `app` to accommodate the servers you've added:

```yml
services:
    app:
        ports:
            - "5000-5001:8080"
```

Then, start the services, specifying how many `app` instances to run:

```
$ docker-compose -f docker-compose.prod.yml --env-file .env.test up --build --scale app=2
```
