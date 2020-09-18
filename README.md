# Pith API

The server-side portion of Pith. It uses [python-socketio](https://github.com/miguelgrinberg/python-socketio) running on the [aiohttp server](https://github.com/aio-libs/aiohttp), [Arq](https://github.com/samuelcolvin/arq) for task queues, [Redis](https://redis.io/) as a database for task and message queues, and [MongoDB](https://www.mongodb.com/) as a database for storing content.

## Development

We use Docker containers to facilitate development and testing. All of the services needed to run the project are defined in `docker-compose.yml`. These are:

-   `app`: the socketio interface that's used by [the React client](https://github.com/rainflame/pith-client).
-   `worker`: a worker script using the [arq task queue](https://github.com/samuelcolvin/arq) for executing assorted long-term tasks such as archiving discussions when they're complete.
-   `redis`: a Redis database used by the task queue (`worker`) and as a message queue by socketio (`app`).
-   `mongo`: the MongoDB database used to store the discussion content.

The docker compose file for testing (`docker-compose.tests.yml`) defines one additional service:

-   `tests`: a container that runs the unit tests and connects to `app` to test the interface.

Addition

### Run it

#### Development

To run the development build:

```
$ docker-compose --env-file .env.test up --build
```

#### Testing

To run the tests:

```
$ docker-compose -f docker-compose.yml -f docker-compose.tests.yml --env-file .env.test up --build
```

To rebuild just the test container:

```
$ docker-compose --env-file .env.test up -d
$ docker-compose -f docker-compose.yml -f docker-compose.tests.yml --env-file .env.test up --build --no-deps tests
```

If you're using a cloud-based Redis or MongoDB database, you can set the respective environment variables in `.env` with the connection information.

```
MONGODB: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGO_NAME=<dbname>
REDIS=redis
```

#### Deployment

To deploy, determine the number of instances of the interface to run. In `haproxy.cfg`, add additional servers as needed:

```
server app01 127.0.0.1:5000 check cookie app01
server app02 127.0.0.1:5001 check cookie app02
server app03 127.0.0.1:5002 check cookie app03
# add more here as needed
```

In `docker-compose.prod.yml`, adjust the port range of the `app` as needed:

```yml
services:
    app:
        ports:
            - "5000-5002:8080"
```

Then, start the services, specifiying how many `app` instances to run:

```
$ docker-compose -f docker-compose.prod.yml --env-file .env.test up --build --scale app=3
```
