import React from "react";

import Unit from "./Unit";
import { LargeHeading, Paragraph } from "./StandardUI";

import SearchLayout from "./SearchLayout";

const Search = (props) => {
	const heading =
		props.query.length > 0
			? `Search results for "${props.query}"`
			: `Type something to search...`;

	const results = props.chatResults?.map((res) => {
		return (
			<Unit
				chat
				id={res.unit_id}
				pith={props.chatUnits[res.unit_id].pith}
			/>
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
				<Paragraph>No results!</Paragraph>
			)}
		</SearchLayout>
	);
};

export default Search;
