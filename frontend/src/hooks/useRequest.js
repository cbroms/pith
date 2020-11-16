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

	// sometimes the UI will make multiple requests to the same function. In this
	// case we want to buffer them so that we're not trying to make a bunch of the
	// same requests at once. Here we make the assumption that the most recent request
	// is the most pertient and we throw away all the others before the most recent.
	const [buffer, setBuffer] = useState([]);

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

			if (buffer.length > 0) {
				// execute the last added request in the buffer
				execute(buffer[buffer.length - 1]);
				// reset the buffer
				setBuffer([]);
			}
		}
	}, [
		status.pending,
		status.made,
		status.requestId,
		buffer,
		completedRequests,
	]);

	const makeRequest = (reqFunc) => {
		if (!status.pending && buffer.length === 0) {
			execute(reqFunc);
		} else {
			// we're currently waiting for a request to complete, so add the request to
			// the buffer and execute it when the first request is done
			const newBuffer = [...buffer];
			newBuffer.push(reqFunc);
			setBuffer(newBuffer);
		}
	};

	return [status, makeRequest];
};

export default useRequest;
