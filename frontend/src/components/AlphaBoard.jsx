import React from "react";

import AlphaBoardLayout from "./AlphaBoardLayout";

const AlphaBoard = (props) => {
    return (
        <AlphaBoardLayout createDiscussion={() => console.log("create new ")} />
    );
};

export default AlphaBoard;
