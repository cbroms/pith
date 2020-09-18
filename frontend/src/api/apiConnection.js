import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { getValue, saveValue } from "./local";

const socket = io(
	`${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`
);

// the number of ms we wait before checking if we've received a respnse from the
// last request and can proceed to make a new one
const TICK = 20;

// amount of time to wait before deciding there was an issue
const TIMEOUT = 5000;

// the queue where we keep the jobs before they're executed
let queue = [];

// the timeout object that recursively counts how long each job has been running
let counterTimeout;

// the current job's elapsed time
let elapsed = 0;

let waitingForCreateUser = false;

function getUserId() {
	return getValue("id");
}

function endCounter() {
	clearTimeout(counterTimeout);
	elapsed = 0;
}

function counter(job) {
	elapsed += TICK;
	if (elapsed >= TIMEOUT) {
		// if this event has timed out, move on to the next event in the queue
		nextEvent();
		// probably want to display this error somewhere on the UI
		console.error(`Timeout request ${job.id}`);
	} else {
		// check in TICK ms later to add more time to elapsed and see if we've
		// timed out on the current job
		counterTimeout = setTimeout(() => {
			counter(job);
		}, TICK);
	}
}

function nextEvent() {
	// end the previous job's counter
	endCounter();
	const id = getUserId();
	if ((!socket.connected || id === null) && !waitingForCreateUser) {
		waitingForCreateUser = true;
		//console.log("Connecting to server");
		connectAndCreateUser();
	} else if (!waitingForCreateUser) {
		if (queue.length > 0) {
			// take the last job off the queue
			const job = queue.pop();
			// if we're going to be waiting for a reply from the server, start the counter
			if (!job.listenEvent) counter(job);
			// make the new request
			job.func();
		}
	}
}

function addToQueue(func, id, listenEvent) {
	// add to the end of the queue
	queue.unshift({ func: func, id: id, listenEvent: listenEvent });
	//console.log(`Queued request ${id}`);
	// if we aren't waiting for anything, start it
	if (elapsed === 0) nextEvent();
}

function connectAndCreateUser() {
	// get the client's IP address
	const req = new Request("https://rainflame.com/cdn-cgi/trace");
	fetch(req)
		.then((response) => response.text())
		.then((text) => {
			const ip = text.substr(text.indexOf("ip=") + 3, 13);

			const payload = { user_id: btoa(ip) };
			socket.emit("create_user", payload, (data) => {
				// save the user id so we can use it later when creating posts etc
				saveValue("id", payload.user_id);
				waitingForCreateUser = false;
				console.log("Server connected");
				// now we're connected and can make the next request
				nextEvent();
			});
		});
}

const listener = (eventName, func) => {
	const id = uuidv4();
	addToQueue(
		() => {
			//console.log(`Adding listener "${eventName}" (request ${id})`);
			socket.on(eventName, (data) => {
				func(JSON.parse(data));
			});
			// we can move on to the next event right away now
			nextEvent();
		},
		id,
		true
	);
};

const setter = (eventName, payload, addAuth, func) => {
	const id = uuidv4();
	addToQueue(
		() => {
			// console.log(`Starting "${eventName}" (request ${id})`);
			// if we have to add the user's id, do that now (assuming that we've connected)
			if (addAuth) {
				if (!payload) {
					payload = {};
				}
				payload["user_id"] = getUserId();
			}
			socket.emit(eventName, payload, (data) => {
				//console.log(`Completed "${eventName}" (request ${id})`);
				nextEvent();
				if (data !== undefined) data = JSON.parse(data);
				func(data);
			});
		},
		id,
		false
	);
};

const getter = (eventName, payload, addAuth, func) => {
	if (payload || addAuth) {
		setter(eventName, payload, addAuth, func);
	} else {
		const id = uuidv4();
		addToQueue(
			() => {
				//console.log(`Starting "${eventName}" (request ${id})`);
				socket.emit(eventName, (data) => {
					//console.log(`Completed "${eventName}" (request ${id})`);
					nextEvent();
					if (data) func(JSON.parse(data));
				});
			},
			id,
			false
		);
	}
};

export { listener, getter, setter, getUserId };
