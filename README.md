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

### Run it

To run the development build:

```
$ sudo docker-compose --env-file .env.test up --build
```

To run the tests:

```
$ sudo docker-compose -f docker-compose.yml -f docker-compose.tests.yml --env-file .env.test up --build
```

If you're using a cloud-based Redis or MongoDB database, you can set the respective environment variables in `docker-compose.yml` with the connection information.

```yml
environment:
    MONGODB_CONN: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
    REDIS_IP: <hostname>
```
