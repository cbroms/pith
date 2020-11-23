import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import {
	requestEdit,
	deeditUnit,
	editUnit,
	addUnit,
	hideUnit,
	moveUnit,
} from "../actions/discussionActions";

import useRequest from "../hooks/useRequest";

import Document from "./Document";

const DocumentContextController = (props) => {
	const [addStatus, makeAdd] = useRequest(props.completedRequests);
	const [requestEditStatus, makeRequestEdit] = useRequest(
		props.completedRequests
	);
	const [requestDeeditStatus, makeRequestDeedit] = useRequest(
		props.completedRequests
	);
	const [editStatus, makeEdit] = useRequest(props.completedRequests);
	const [hideStatus, makeHide] = useRequest(props.completedRequests);
	const [moveStatus, makeMove] = useRequest(props.completedRequests);

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
		//console.log("UNIT EDIT CALLED");
		// TODO this wasn't working when called from inserting a unit id into the document
		// investigate why pending is still true even after editing for some reason.
		//if (!editStatus.pending) {
		console.log(`editing unit: ${unitId} with content ${pith}`);
		makeEdit((requestId) => {
			props.dispatch(editUnit(unitId, pith, requestId));
		});
		//}
	};

	const onUnitCreate = (pith, parentUnit, position) => {
		if (!addStatus.pending) {
			console.log(
				`adding unit with content ${pith} at position ${position + 1}`
			);
			makeAdd((requestId) => {
				props.dispatch(
					addUnit(pith, parentUnit, position + 1, requestId)
				);
			});
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

	const onUnitMove = (unitId, destinationId, position) => {
		if (!moveStatus.pending) {
			console.log(
				`moving unit ${unitId} to ${destinationId} position ${position}`
			);
			makeMove((requestId) => {
				props.dispatch(
					moveUnit(unitId, destinationId, position, requestId)
				);
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
	if (
		addStatus.pending ||
		editStatus.pending ||
		hideStatus.pending ||
		moveStatus.pending
	) {
		//console.log("witholding state from document");
		docMap = null;
	}

	return (
		<Document
			{...props}
			newUnitId={addStatus.additional?.unit_id}
			docMap={docMap}
			onUnitFocus={onUnitFocus}
			onUnitBlur={onUnitBlur}
			onUnitEdit={onUnitEdit}
			onUnitCreate={onUnitCreate}
			onUnitDelete={onUnitDelete}
			onUnitMove={onUnitMove}
		/>
	);
};

export default DocumentContextController;
