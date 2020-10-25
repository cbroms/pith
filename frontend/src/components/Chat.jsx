import React, { useState } from "react";

import * as dayjs from "dayjs";
import * as calendar from "dayjs/plugin/calendar";
import * as utc from "dayjs/plugin/utc";

import { parseLinks } from "../utils/parseLinks";

import ChatLayout from "./ChatLayout";
import PostUnitLayout from "./PostUnitLayout";
import PostLayout from "./PostLayout";
import Unit from "./Unit";
import TextEditor from "./TextEditor";

dayjs.extend(calendar);
dayjs.extend(utc);

const Chat = (props) => {
    const [currentlyActive, setCurrentlyActive] = useState({
        id: null,
        num: null,
    });

    const postGroups = [];

    for (const i in props.posts) {
        const post = { ...props.content[props.posts[i]], id: props.posts[i] };
        if (i > 0) {
            const prevPost = props.content[props.posts[i - 1]];
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

    const meta = [];

    // calculate the post times before adding the transclusions
    for (const group of postGroups) {
        const date = dayjs(group[0].created_at).utc().local();

        const formattedDate = dayjs(date).calendar(null, {
            sameDay: "[Today at] h:mm a",
            lastDay: "[Yesterday at] h:mm a",
            lastWeek: "dddd [at] h:mm a",
            sameElse: "MM/D/YY [at] h:mm a",
        });

        meta.push({ date: formattedDate, author: group[0].author });
    }

    // add the referenced posts to the groups
    for (const i in postGroups) {
        const group = postGroups[i];
        for (const j in group) {
            const links = parseLinks(group[j].pith).reverse();

            for (const k in links) {
                const link = links[k];

                const obj = {
                    ...props.content[link],
                    id: `${group[j].id}-${props.content[link].id}`,
                    transcluded: true,
                    transcludeNum: links.length - k,
                    totalTranscluded: links.length,
                };
                postGroups[i].splice(j, 0, obj);
            }
        }
    }

    const posts = postGroups.map((group, i) => {
        const units = group.map((post) => {
            const unit = (
                <Unit
                    chat
                    id={post.id}
                    pith={post.pith}
                    transcludeNum={post.transcludeNum}
                    transcluded={post.transcluded}
                    transcludeHoverActive={
                        post.transcluded
                            ? post.id.includes(currentlyActive.id) &&
                              currentlyActive.num === post.transcludeNum
                            : false
                    }
                    linkHovered={(num) => {
                        setCurrentlyActive({ id: post.id, num: num });
                    }}
                    linkUnhovered={() => {
                        setCurrentlyActive({ id: null, num: null });
                    }}
                />
            );
            return (
                <PostUnitLayout
                    topTransclude={post?.transcludeNum === 1}
                    bottomTransclude={
                        post?.totalTranscluded === post?.transcludeNum
                    }
                    transcluded={post.transcluded}
                    unit={unit}
                    key={`${post.id}-${
                        post.transcluded ? group[group.length - 1].id : "og"
                    }`}
                />
            );
        });

        return (
            <PostLayout
                author={meta[i].author}
                time={meta[i].date}
                key={`${group[group.length - 1].id}-group`}
            >
                {units}
            </PostLayout>
        );
    });

    const editor = (
        <TextEditor
            openSearch={props.openSearch}
            closeSearch={props.closeSearch}
            setQuery={props.setQuery}
        />
    );
    return <ChatLayout editor={editor}>{posts}</ChatLayout>;
};

export default Chat;
