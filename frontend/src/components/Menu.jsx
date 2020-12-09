import React from "react";

import { Link } from "react-router-dom";

import CopyContent from "./CopyContent";
import MenuLayout from "./MenuLayout";
import DarkToggleLayout from "./DarkToggleLayout";

const Menu = (props) => {
	const darkToggle = <DarkToggleLayout setDarkMode={props.setDarkMode} />;
	const copyUrl = <CopyContent data={window.location.href} />;

	const content = (
		<React.Fragment>
			<Link to="/">Your discussions</Link>
		</React.Fragment>
	);

	return (
		<MenuLayout
			content={content}
			darkToggle={darkToggle}
			copyUrl={copyUrl}
		/>
	);
};

export default Menu;
