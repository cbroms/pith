import React from "react";

import { Link } from "react-router-dom";
import MenuLayout from "./MenuLayout";
import DarkToggleLayout from "./DarkToggleLayout";

const Menu = (props) => {
	const darkToggle = <DarkToggleLayout setDarkMode={props.setDarkMode} />;

	const content = (
		<div>
			<Link to="/">Your discussions</Link>
		</div>
	);

	return <MenuLayout content={content} darkToggle={darkToggle} />;
};

export default Menu;
