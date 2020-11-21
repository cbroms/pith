import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import {
	requestEdit,
	deeditUnit,
	editUnit,
	addUnit,
	hideUnit,
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
	const [hideStatus, makeHide] = useRequest(props.completedRequests);

	const onUnitFocus = (unitId) => {
		// when the user clicks into the unit, request editing privilages for it
		if (!requestEditStatus.pending) {
			console.log("requesting edit lock on unit: ", unitId);
			makeRequestEdit((requestId) => {
				props.dispatch(requestEdit(unitId, requestId));
			});
		}
	};

	const onUnitBlur = (unitId) => {
		// when the user clicks out of the unit, release editing privilages for it
		if (!requestDeeditStatus.pending) {
			console.log("releasing edit lock on unit: ", unitId);
			makeRequestDeedit((requestId) => {
				props.dispatch(deeditUnit(unitId, requestId));
			});
		}
	};

	const onUnitEdit = (unitId, pith) => {
		if (!editStatus.pending) {
			console.log(`editing unit: ${unitId} with content ${pith}`);
			makeEdit((requestId) => {
				props.dispatch(editUnit(unitId, pith, requestId));
			});
		}
	};

	const onUnitCreate = (pith, parentUnit, position) => {
		if (!addUnitStatus.pending) {
			console.log(
				`adding unit with content ${pith} at position ${position + 1}`
			);
			makeAddUnit(
				(requestId) => {
					props.dispatch(
						addUnit(pith, parentUnit, position + 1, requestId)
					);
				},
				(additional) => {
					console.log(additional);
				}
			);
		}
	};

	const onUnitDelete = (unitId) => {
		if (!hideStatus.pending) {
			console.log(`removing unit ${unitId}`);
			makeHide((requestId) => {
				props.dispatch(hideUnit(unitId, requestId));
			});
		}
	};

	// we want to conrol when the document gets a new state rather than always pass it
	// everytime there's an update. So, check all of the request statuses, and if any of
	// them are pending, pass in null for the state so the document knows to keep its local
	// copy of the state that reflects the user's changes.
	let docMap = props.docMap;

	// dont make edit requests result in showing the state copy
	// requestEditStatus.pending ||
	// 	requestDeeditStatus.pending ||
	if (addUnitStatus.pending || editStatus.pending || hideStatus.pending) {
		//console.log("witholding state from document");
		docMap = null;
	}

	return (
		<Document
			{...props}
			newUnitId={addUnitStatus.additional?.unit_id}
			docMap={docMap}
			onUnitFocus={onUnitFocus}
			onUnitBlur={onUnitBlur}
			onUnitEdit={onUnitEdit}
			onUnitCreate={onUnitCreate}
			onUnitDelete={onUnitDelete}
		/>
	);
};

export default DocumentContextController;
