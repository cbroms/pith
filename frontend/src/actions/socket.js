import io from "socket.io-client";

const socket = io(
    `${process.env.REACT_APP_BACKEND_HOST}:${
        process.env.REACT_APP_BACKEND_PORT
    }/discussion`
);

export { socket };
