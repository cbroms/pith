import React, { useState } from "react";

import CopyContentLayout from "./CopyContentLayout";

const CopyContent = (props) => {
	const [copied, setCopied] = useState(false);

	const execCopy = () => {
		let data = props.data || "";
		// this could fail if using IE
		// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write
		navigator.clipboard.writeText(data);

		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};
	return (
		<CopyContentLayout
			data={props.data}
			onCopy={execCopy}
			copied={copied}
			prompt={copied ? "Copied" : "Click to copy"}
		/>
	);
};

export default CopyContent;
