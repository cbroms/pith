# Pith API

The server-side portion of Pith. It uses [python-socketio](https://python-socketio.readthedocs.io/en/latest/index.html) running on the [uvicorn ASGI server](https://www.uvicorn.org/).

## Development

Commands are written assuming installation on Linux. More generally, here are the steps that you need to take for installation on any other operating system:

-   Install and run the database (MongoDB)
-   Install Pith API's dependencies
-   Run the development server

### Install the database

We use MongoDB as the database for Pith. Install it locally on your machine following [MongoDB's instructions](https://docs.mongodb.com/manual/installation/). Start it:

```
$ sudo systemctl start mongod
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
uvicorn app:app --reload
```

Now, the server should be up and running locally on port 8000. You can connect from the [Pith client](https://github.com/rainflame/pith-client), which creates a websockets connection with the API.
