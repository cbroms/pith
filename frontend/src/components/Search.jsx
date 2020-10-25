import React from "react";

import { LargeHeading } from "./StandardUI";

import SearchLayout from "./SearchLayout";

const Search = (props) => {
	const heading =
		props.query.length > 0
			? `Search results for "${props.query}"`
			: `Type something to search...`;
	return (
		<SearchLayout>
			<LargeHeading>{heading}</LargeHeading>
		</SearchLayout>
	);
};

export default Search;
