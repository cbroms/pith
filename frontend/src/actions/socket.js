import io from "socket.io-client";

const socket = io(`45.79.183.28:8080/discussion`);

export { socket };
