import React from "react";

import MenuLayout from "./MenuLayout";
import DarkToggleLayout from "./DarkToggleLayout";

const Menu = (props) => {
    const darkToggle = <DarkToggleLayout setDarkMode={props.setDarkMode} />;

    return <MenuLayout darkToggle={darkToggle} />;
};

export default Menu;
