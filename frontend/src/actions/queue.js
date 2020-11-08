import { REQUEST_TIMEOUT } from "./types";

// ids in order that we want to execute
const queue = [];
// ids -> exec function
const requests = {};

const execNext = () => {
  console.log("queue", queue);
  if (queue.length > 0) {
    const id = queue[0];
    console.log("executing request", id);
    requests[id].exec();
  }
};

const cleanUpRequest = (id, callback = null) => {
  if (Object.keys(requests).includes(id)) {
    console.log("removing request", id);
    // remove the request from the queue
    queue.shift();
    // remove from the requests map
    delete requests[id];

    // if there's a callback containing a dispatch to end a pending
    // request in state, execute it here
    if (callback !== null) {
      callback();
    }

    // move on the next
    execNext();
  }
};

// the handler we use to wrap all requests to the api
const createRequestWrapper = (dispatch, id, timeout = 5000) => {
  let interval;
  let elapsed = 0;

  const startRequest = (func) => {
    console.log("adding request", id);
    // add the function to the queue
    queue.push(id);
    // add the function to the map
    requests[id] = {
      exec: () => {
        // exectute the request (socket.emit...)
        func();
        // check that the request is still active after some duration
        interval = setInterval(() => {
          elapsed += 1000;

          if (elapsed >= timeout) {
            console.error("request timed out", func);
            dispatch({
              type: REQUEST_TIMEOUT,
            });
            clearInterval(interval);
          }
        }, 1000);
      },
    };

    execNext();
  };

  // when the request completes, clear the interval
  const endRequest = (func) => {
    clearInterval(interval);
  };

  return [startRequest, endRequest];
};

export { cleanUpRequest, createRequestWrapper };
