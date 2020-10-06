import React from "react";
import styled from "styled-components";

import ChatLayout from "./ChatLayout";
import Unit from "./Unit";

const Chat = (props) => {
    const postGroups = [];
    for (const i in props.posts) {
        const post = props.posts[i];
        if (i > 0) {
            const prevPost = props.posts[i - 1];
            // TODO: check if some duration of time has passed between posts
            if (prevPost.author === post.author) {
                const group = postGroups.pop();
                group.push(post);
                postGroups.push(group);
            } else {
                postGroups.push([post]);
            }
        } else {
            postGroups.push([post]);
        }
    }
    const posts = postGroups.map((group) => {
        const units = group.map((post) => {
            return <Unit pith={post.pith} key={post.id} />;
        });
        return (
            <div>
                {group[0].author}
                {units}
            </div>
        );
    });
    return <ChatLayout>{posts}</ChatLayout>;
};

export default Chat;
