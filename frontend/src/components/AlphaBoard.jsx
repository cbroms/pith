import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useRequest } from "../hooks/useRequest";
import { parseTime } from "../utils/parseTime";
import { getLocalDiscussions, createDiscussion } from "../actions/boardActions";

import DarkToggleLayout from "./DarkToggleLayout";
import AlphaBoardLayout from "./AlphaBoardLayout";

const AlphaBoard = (props) => {
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!initialized) {
			props.dispatch(getLocalDiscussions());
			setInitialized(true);
		}
	});

	const discussions = props.discussions?.map((discussion) => {
		const date = parseTime(discussion.createdAt).toLowerCase();

		return (
			<li key={discussion.id}>
				<Link to={`d/${discussion.id}`}>Created {date}</Link>
			</li>
		);
	});

	const darkToggle = <DarkToggleLayout setDarkMode={props.setDarkMode} />;

	return (
		<AlphaBoardLayout
			darkToggle={darkToggle}
			hasDiscussions={props.discussions.length > 0}
			discussions={<ul>{discussions}</ul>}
			createDiscussion={() => props.dispatch(createDiscussion())}
		/>
	);
};

export default AlphaBoard;
