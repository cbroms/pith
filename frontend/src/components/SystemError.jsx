import React, { useState } from "react";

import SystemErrorLayout from "./SystemErrorLayout";

const SystemError = (props) => {
	const [open, toggleOpen] = useState(true);

	return (
		<SystemErrorLayout
			open={props.error && open}
			onClose={() => toggleOpen(false)}
		/>
	);
};

export default SystemError;
