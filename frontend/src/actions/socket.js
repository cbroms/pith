import io from "socket.io-client";

const discussionSocket = io(
	`${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}/discussion`
);

const boardSocket = io(
	`${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`
);

export { boardSocket, discussionSocket };
