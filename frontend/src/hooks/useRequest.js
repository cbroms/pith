import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const useRequest = (completedRequests) => {
	// there are three possible states:
	// null -> we haven't made the request yet
	// true -> we made the request and are waiting for it to complete
	// false -> the request has completed
	const [status, setStatus] = useState({
		pending: false,
		made: false,
		requestId: null,
	});

	const [queue, setQueue] = useState([]);

	const execute = (func) => {
		// make some kind of request (usually dispatch an action)
		const requestId = uuidv4();
		// here we pass a randomly generated id to identify this request in
		// the completedRequests array in the redux store
		func(requestId);
		setStatus({ made: true, pending: true, requestId: requestId });
	};

	// check if the request has completed when the props change
	useEffect(() => {
		if (
			status.pending &&
			status.made &&
			Object.keys(completedRequests).includes(status.requestId)
		) {
			setStatus({
				...completedRequests[status.requestId],
				pending: false,
				made: true,
			});

			if (queue.length > 0) {
				// get the last first from the queue
				execute(queue[0]);
				const newQueue = [...queue];
				newQueue.splice(0, 1);
				console.log(newQueue);
				setQueue(newQueue);
			}
		}
	}, [status.pending, status.made, status.requestId, completedRequests]);

	const makeRequest = (reqFunc) => {
		if (!status.pending && queue.length === 0) {
			execute(reqFunc);
		} else {
			const newQueue = [...queue];
			newQueue.push(reqFunc);
			setQueue(newQueue);
		}
	};

	return [status, makeRequest];
};

export default useRequest;
