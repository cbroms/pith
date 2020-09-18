import React, { useState, useEffect } from "react";

import "./style/AccordionPanel.css";

function AccordionPanel(props) {
	const [isOpen, toggleOpen] = useState(props.open);

	useEffect(() => {
		if (isOpen && props.onOpen) props.onOpen();
	}, [isOpen]);

	return (
		<div>
			<h2 className="section-header" onClick={() => toggleOpen(!isOpen)}>
				{props.title}
				<span className="section-toggle-icon">
					{isOpen ? "▴" : "▾"}
				</span>
			</h2>
			<div
				className="section"
				style={
					isOpen
						? { height: "auto" }
						: { height: "0px", overflow: "hidden" }
				}
			>
				{props.children}
			</div>
		</div>
	);
}

export default AccordionPanel;
