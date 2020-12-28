import io from "socket.io-client";

let socket;

export const connect = (host, port) => {
	socket = io(`${host}:${port}/discussion`);

	socket.on("connect", () => {
		console.log("connected");
	});
	console.log("connecting");
};

export const test = () => {
	console.log("testing");
	console.log(socket);
	socket.emit("test_connect", {}, (res) => {
		const response = JSON.parse(res);
		console.log(response);
	});
};
