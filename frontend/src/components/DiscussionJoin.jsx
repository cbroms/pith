import React from "react";

import TextEditor from "./TextEditor";

import DiscussionJoinLayout from "./DiscussionJoinLayout";

const DiscussionJoin = (props) => {
    console.log("discussion join");
    const editor = (
        <TextEditor
            showButton
            buttonDir="right"
            placeholder="type a nickname..."
        />
    );
    return <DiscussionJoinLayout editor={editor} />;
};

export default DiscussionJoin;
