import React from "react";

import { parseTime } from "../utils/parseTime";

import Unit from "./Unit";
import { LargeHeading, Paragraph } from "./StandardUI";

import SearchLayout from "./SearchLayout";
import PostLayout from "./PostLayout";
import PostUnitLayout from "./PostUnitLayout";

const Search = (props) => {
	const heading =
		props.query.length > 0
			? `Search results for "${props.query}"`
			: `Type something to search...`;

	const results = props.forChat ? props.chatResults : props.docResults;
	const formattedResults = results?.map((res) => {
		const unitContent = props.forChat
			? props.chatUnits[res.unit_id]
			: props.docUnits[res.unit_id];

		console.log(unitContent.pith);
		if (unitContent.hidden) {
			// don't show hidden units
			return null;
		}
		const unit = (
			<Unit
				chat={props.forChat}
				id={res.unit_id}
				pith={unitContent.pith}
				highlight={props.query}
			/>
		);

		if (props.forChat) {
			return (
				<PostLayout
					author={props.chatUnits[res.unit_id].author}
					time={parseTime(props.chatUnits[res.unit_id].createdAt)}
					key={`${res.unit_id}-searchRes`}
				>
					<PostUnitLayout
						down
						actionsVisible
						moveActionTitle="Use reference"
						onMove={() => props.selectUnit(res.unit_id)}
						unit={unit}
					/>
				</PostLayout>
			);
		} else {
			return (
				<PostUnitLayout
					actionsVisible
					moveActionTitle="Use reference"
					key={`${res.unit_id}-searchRes`}
					onMove={() => props.selectUnit(res.unit_id)}
					unit={unit}
				/>
			);
		}
	});

	return (
		<SearchLayout>
			<LargeHeading>{heading}</LargeHeading>
			{props.searching ? (
				<Paragraph>searching...</Paragraph>
			) : results?.length > 0 && props.query !== "" ? (
				formattedResults
			) : (
				<Paragraph>No results.</Paragraph>
			)}
		</SearchLayout>
	);
};

export default Search;
