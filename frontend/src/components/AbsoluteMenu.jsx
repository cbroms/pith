import React from "react";
import ReactTooltip from "react-tooltip";

import "./style/AbsoluteMenu.css";

function AbsoluteMenu(props) {
	let icon = "▼";

	if (props.icon) {
		icon = (
			<img
				className={props.iconClass}
				alt={props.iconClass}
				src={props.icon}
			/>
		);
	}
	return (
		<div
			className={
				props.alwaysOn
					? "absolute-menu-wrapper-on"
					: "absolute-menu-wrapper"
			}
		>
			<a
				data-tip
				data-for={props.id}
				data-event="click focus"
				className="absolute-menu-control"
			>
				{icon}
			</a>
			<ReactTooltip
				id={props.id}
				globalEventOff="click"
				afterShow={props.onShow || (() => {})}
				afterHide={props.onHide || (() => {})}
				place={props.position || "bottom"}
				className="absolute-menu"
			>
				{props.children}
			</ReactTooltip>
		</div>
	);
}

export default AbsoluteMenu;
