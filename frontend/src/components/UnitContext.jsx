import React, { useState, useEffect } from "react";

import Unit from "./Unit";

const UnitContext = (props) => {
	const [hasContext, setHasContext] = useState(null);

	useEffect(() => {
		if (hasContext === null) {
			// the first time we "render", don't fetch the data
			// this happens automatically the first time the entire page renders
			setHasContext(Object.keys(props.units).includes(props.id));
		} else if (hasContext === false && !props.gettingUnitContext) {
			// the next time we render and don't have the unit's pith, fetch it
			props.getUnitContext(props.id);
		}
	}, [hasContext, props]);

	return (
		<Unit pith={hasContext ? props.units[props.id].pith : ""} charLimited />
	);
};

export default UnitContext;
