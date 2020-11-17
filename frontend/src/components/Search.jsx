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

	const results = props.chatResults?.map((res) => {
		const unit = (
			<Unit
				chat
				id={res.unit_id}
				pith={props.chatUnits[res.unit_id].pith}
				highlight={props.query}
			/>
		);
		return (
			<PostLayout
				author={props.chatUnits[res.unit_id].author}
				time={parseTime(props.chatUnits[res.unit_id].createdAt)}
				key={`${res.unit_id}-searchRes`}
			>
				<PostUnitLayout
					down
					onMove={() => props.selectUnit(res.unit_id)}
					unit={unit}
				/>
			</PostLayout>
		);
	});

	return (
		<SearchLayout>
			<LargeHeading>{heading}</LargeHeading>
			{props.searching ? (
				<Paragraph>searching...</Paragraph>
			) : results?.length > 0 ? (
				results
			) : (
				<Paragraph>No results.</Paragraph>
			)}
		</SearchLayout>
	);
};

export default Search;
