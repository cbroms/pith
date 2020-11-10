import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const usePending = (completedRequests) => {
	// there are three possible states:
	// null -> we haven't made the request yet
	// true -> we made the request and are waiting for it to complete
	// false -> the request has completed
	const [status, setStatus] = useState({ pending: false, made: false });

	let requestId = null;

	// check if the request has completed when the props change
	useEffect(() => {
		if (
			status.pending &&
			status.made &&
			Object.keys(completedRequests).includes(requestId)
		) {
			setStatus({
				...completedRequests[requestId],
				pending: false,
				made: true,
			});
		}
	});

	const makeRequest = (reqFunc) => {
		// make some kind of request (usually dispatch an action)
		requestId = uuidv4();
		// here we pass a randomly generated id to identify this request in
		// the completedRequests array in the redux store
		reqFunc(requestId);
		setStatus({ made: true, pending: true });
	};

	return [status, makeRequest];
};

export default usePending;
