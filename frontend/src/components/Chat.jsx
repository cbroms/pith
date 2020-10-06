import React from "react";
import styled from "styled-components";
import * as dayjs from "dayjs";
import * as calendar from "dayjs/plugin/calendar";
import * as utc from "dayjs/plugin/utc";

import ChatLayout from "./ChatLayout";
import PostLayout from "./PostLayout";
import Unit from "./Unit";

dayjs.extend(calendar);
dayjs.extend(utc);

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

        const date = dayjs(group[0].created_at)
            .utc()
            .local();

        const formattedDate = dayjs(date).calendar(null, {
            sameDay: "[Today at] h:mm a",
            lastDay: "[Yesterday at] h:mm a",
            lastWeek: "dddd [at] h:mm a",
            sameElse: "MM/D/YY [at] h:mm a",
        });

        return (
            <PostLayout
                author={group[0].author}
                time={formattedDate}
                key={`${group[group.length - 1].id}-group`}
            >
                {units}
            </PostLayout>
        );
    });
    return <ChatLayout>{posts}</ChatLayout>;
};

export default Chat;
