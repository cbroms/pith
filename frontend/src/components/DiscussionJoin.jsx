import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import TextEditor from "./TextEditor";

import DiscussionJoinLayout from "./DiscussionJoinLayout";

const DiscussionJoin = (props) => {
    const [nickname, setNickname] = useState(null);

    const editor = (
        <TextEditor
            showButton
            focus
            buttonDir="right"
            placeholder="type a nickname..."
            unitEnter={(caret, content) => {
                props.onComplete(content);
                setNickname(content);
            }}
        />
    );
    return (
        <DiscussionJoinLayout
            editor={editor}
            done={nickname !== null}
            nickname={nickname}
            joiningScreen={props.joiningScreen}
        />
    );
};

export default DiscussionJoin;
