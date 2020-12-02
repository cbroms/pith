# Pith

This repository contains the code for running a Pith server and client interface.

You can try out the project at [pith.is](https://pith.is). You can run your own Pith server following [the instructions below](#deployment).

## Development

There are two primary components to this project:

### Frontend

The client-side portion is a [React](https://reactjs.org/) project using [Redux](https://redux.js.org/) for state management and the [socket.io client library](https://socket.io/docs/client-api/) for interfacing with the backend. You can find the client code in the `/frontend` directory.

### Backend

The server-side portion of Pith. It uses [python-socketio](https://github.com/miguelgrinberg/python-socketio) running on the [aiohttp server](https://github.com/aio-libs/aiohttp), [Arq](https://github.com/samuelcolvin/arq) for task queues, [Redis](https://redis.io/) as a database for task and message queues, and [MongoDB](https://www.mongodb.com/) as a database for storing content. You can find it in the `/backend` directory.

### Containers

We use Docker containers to facilitate development and testing. All of the services needed to run the project are defined in `docker-compose.yml`. These are:

-   `static`: serves the React client
-   `app`: the socketio interface that's used by the React client.
-   `worker`: a worker script using the [arq task queue](https://github.com/samuelcolvin/arq) for executing assorted long-term tasks such as archiving discussions when they're complete.
-   `redis`: a Redis database used by the task queue (`worker`) and as a message queue by socketio (`app`).
-   `mongo`: the MongoDB database used to store the discussion content.
-   `tests`: a container that runs the unit tests and connects to `app` to test the interface.

The containers use volumes to easily facilitate development. You can edit any code in `/backend/src` and `/frontend/src` and containers that rely on that code will automatically reload.

### Run it

If you are running on a remote machine, copy the `.env.test` file to a `.env` file. Change `HOST_NAME` within the `.env` file to the external IP address of the remote machine. Use `.env` instead of `.env.test` in the following commands.

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

### Quickstart

The best way to set up a Pith server will require having:

-   A computer running Linux (ideally an Ubuntu VM)
-   Docker
-   A web domain
-   An SSL certificate for the domain
-   An S3 bucket

A barebones install will require:

-   A computer running Linux
-   Docker

#### Prerequisites

First, you'll probably want a Linux server running Ubuntu. The most basic \$5 tier virtual machine offerings from [Linode](https://www.linode.com/products/shared/) or [Digital Ocean](https://www.digitalocean.com/products/droplets/) should work fine in most cases.

Ensure you've [installed Docker](https://docs.docker.com/engine/install/ubuntu/) on the machine and [set up a Docker group](https://docs.docker.com/engine/install/linux-postinstall/).

Next, you'll likely want to obtain a domain (or create a sub-domain), otherwise you can access the server directly albeit _without_ SSL. If you're using a domain, we recommend that you also obtain a free SSL certificate from a CA such as [Cloudflare](https://www.cloudflare.com/ssl/) or [Let's Encrypt](https://letsencrypt.org/getting-started/).

Finally, you'll also need an S3 bucket, which can be [obtained from AWS](https://aws.amazon.com/s3/). If you opt not to use one, be aware that the document export will not function.

#### Clone the project

To get started, clone this repository to your server:

```
$ git clone https://github.com/rainflame/pith.git
$ cd pith
```

#### Create an ENV file

You will need to create a `.env` file in the root of this repository containing a few key environment variables. We'd recommend making a copy of `.env.test`:

```
$ cp .env.test .env
```

Then populate these variables in `.env` with your values:

```
MONGO_USER=<a default user for MongoDB>
MONGO_PASS=<a default user's password for MongoDB>
HOST_NAME=<your domain name, otherwise the IP of your server>
AWS_WORKER_ACCESS_KEY=<access key for your S3 bucket>
AWS_WORKER_SECRET_KEY=<secret key for your S3 bucket>

```

#### Add the SSL certificate

If you're using an SSL certificate, create a combined certificate file for your domain. You'll need the private key generated by the CA, the certificate generated by the CA, and the CA's origin root certificate (if your CA has one; Cloudflare's can be [found here](https://support.cloudflare.com/hc/en-us/articles/115000479507-Managing-Cloudflare-Origin-CA-certificates#h_30cc332c-8f6e-42d8-9c59-6c1f06650639)). Create a file called `cert.pem` with the keys in this format:

```
-----BEGIN CERTIFICATE-----
<your certificate>
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
<the CA's origin root certificate>
-----END CERTIFICATE-----
-----BEGIN PRIVATE KEY-----
<your private key>
-----END PRIVATE KEY-----
```

Then, in `haproxy.cfg`, uncomment these lines so the certificate file is loaded by the hapoxy load balancer:

```
bind *:443 ssl crt /cert.pem  # ssl cert goes here
redirect scheme https if !{ ssl_fc } # redirect to ssl
```

#### Run the Docker stack

To deploy the project, run the Docker stack:

```
$ docker-compose -f docker-compose.prod.yml --env-file .env up --build
```

The project will now be accessible from the server's IP address on port 443 if you're using an SSL certificate or port 80 otherwise. If you're using a domain, set its DNS to resolve to the server's IP address with an A record.

### Load Balancing

If you'd like, you can add additional instances of the socketio interface to handle higher traffic. Determine the number of instances of the interface you'd like to run. In `haproxy.cfg`, add additional servers as needed:

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
$ docker-compose -f docker-compose.prod.yml --env-file .env up --build --scale app=2
```
