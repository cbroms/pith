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
			<a href="https://pith.is">Pith home</a>
			<a href="https://why.pith.is">Pith blog</a>
			<a href="https://github.com/rainflame/pith">Get the code</a>
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
