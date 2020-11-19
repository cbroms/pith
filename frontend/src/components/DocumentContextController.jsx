import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import {
	requestEdit,
	deeditUnit,
	editUnit,
} from "../actions/discussionActions";

import useRequest from "../hooks/useRequest";

import Document from "./Document";

const DocumentContextController = (props) => {
	const [addUnitStatus, makeAddUnit] = useRequest(props.completedRequests);
	const [requestEditStatus, makeRequestEdit] = useRequest(
		props.completedRequests
	);
	const [requestDeeditStatus, makeRequestDeedit] = useRequest(
		props.completedRequests
	);
	const [editStatus, makeEdit] = useRequest(props.completedRequests);

	const onUnitFocus = (unitId) => {
		// when the user clicks into the unit, request editing privilages for it
		if (!requestEditStatus.pending) {
			console.log("requesting edit lock on unit: ", unitId);
			makeRequestEdit((requestId) => {
				props.dispatch(requestEdit(unitId, requestId));
			});
		}
	};

	const onUnitDefocus = (unitId) => {
		// when the user clicks out of the unit, release editing privilages for it
		if (!requestDeeditStatus.pending) {
			console.log("releasing edit lock on unit: ", unitId);
			makeRequestDeedit((requestId) => {
				props.dispatch(deeditUnit(unitId, requestId));
			});
		}
	};

	const onUnitEdit = (unitId, content) => {
		if (!editStatus.pending) {
			console.log(`editing unit: ${unitId} with content ${content}`);
			makeEdit((requestId) => {
				props.dispatch(editUnit(unitId, content, requestId));
			});
		}
	};

	return (
		<Document
			{...props}
			onUnitFocus={onUnitFocus}
			onUnitDefocus={onUnitDefocus}
			onUnitEdit={onUnitEdit}
		/>
	);
};

export default DocumentContextController;
