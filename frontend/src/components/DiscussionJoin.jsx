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
            unitEnter={(caret, content, cleanContent) => {
                props.onComplete(cleanContent);
                setNickname(cleanContent);
            }}
        />
    );
    return (
        <DiscussionJoinLayout
            editor={editor}
            done={nickname !== null && !props.badNickname}
            badNickname={props.badNickname}
            badDiscussion={props.badDiscussion}
            nickname={nickname}
            joiningScreen={props.joiningScreen}
            loadingScreen={props.loadingScreen}
        />
    );
};

export default DiscussionJoin;
