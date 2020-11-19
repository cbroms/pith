import {
  COMPLETE_REQUEST,
  REQUEST_TIMEOUT,
  RESET_REQUEST_TIMEOUT,
} from "../reducers/types";

// ids in order that we want to execute
const queue = [];
// ids -> exec function
const requests = {};

const execNext = () => {
  //console.log("queue", queue);
  if (queue.length > 0) {
    const id = queue[0];

    // ensure the request has not been made, since execNext is called every time
    // something is added to the queue, regardless of if the request is complete
    if (!requests[id].made) {
      //console.log("executing request", id);
      requests[id].made = true;
      requests[id].exec();
    }
  }
};

// the handler we use to wrap all requests to the api
const createRequestWrapper = (actionType, dispatch, id, timeoutTime = 5000) => {
  let timeout;

  const startRequest = (func) => {
    // console.log("adding request", id);
    // add the function to the queue
    queue.push(id);
    // add the function to the map
    requests[id] = {
      made: false,
      exec: () => {
        // exectute the request (socket.emit...)
        func();
        // check that the request is still active after some duration
        timeout = setTimeout(() => {
          console.error("request timed out", func);
          dispatch({
            type: REQUEST_TIMEOUT,
          });
        }, timeoutTime);
      },
    };

    execNext();
  };

  // when the request completes, clear the interval
  const endRequest = (statusCode) => {
    clearTimeout(timeout);

    //console.log("removing request", id);

    // remove the request from the queue
    queue.shift();
    // remove from the requests map
    delete requests[id];
    // move on the next in queue
    execNext();

    dispatch({
      type: RESET_REQUEST_TIMEOUT,
    });
    dispatch({
      type: COMPLETE_REQUEST,
      payload: {
        id: id,
        value: {
          action: actionType,
          status: statusCode,
        },
      },
    });
  };

  return [startRequest, endRequest];
};

export { createRequestWrapper };
