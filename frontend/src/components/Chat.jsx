import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

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

    const [lastPosted, setLastPosted] = useState({});

    const postGroups = [];
    let posts = [...props.posts];
    let content = { ...props.content };

    // if a post is pending, add it to the list of posts
    if (props.postPending && !posts.includes(lastPosted.id)) {
        const tempPost = {
            ...lastPosted,
            author: props.nickname || "you",
            createdAt: new Date().toISOString(),
        };
        content[lastPosted.id] = tempPost;
        posts.push(lastPosted.id);
    } else if (posts.includes(lastPosted.id)) {
        // TODO: keep the objects the same, just replace the id of the temporary
        // post with the acutal id provided by the backend
        posts = [...props.posts];
        content = { ...props.content };
    }

    for (const i in posts) {
        const post = { ...content[posts[i]], id: posts[i] };
        if (i > 0) {
            const prevPost = content[posts[i - 1]];
            // check if 30 minutes has passed between posts
            const prevTime = Date.parse(prevPost.createdAt);
            const thisTime = Date.parse(post.createdAt);
            const minDiff = Math.floor((thisTime - prevTime) / 1000 / 60);
            // group posts by the same author made within 30 mins of the last post together
            if (prevPost.author === post.author && minDiff < 30) {
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
        const date = dayjs(group[0].createdAt).local();

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
                    ...content[link],
                    id: `${group[j].id}-${content[link].id}`,
                    transcluded: true,
                    transcludeNum: links.length - k,
                    totalTranscluded: links.length,
                };
                postGroups[i].splice(j, 0, obj);
            }
        }
    }

    const postList = postGroups.map((group, i) => {
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
                    greyed={post.temporary}
                    topTransclude={post?.transcludeNum === 1}
                    bottomTransclude={
                        post.transcluded &&
                        post?.totalTranscluded === post?.transcludeNum
                    }
                    transcluded={post.transcluded}
                    onMove={() => props.sendPostToDoc(post.id)}
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
            showButton
            showRenderDisplay={false}
            openSearch={props.openSearch}
            closeSearch={props.closeSearch}
            setQuery={props.setQuery}
            contentToAdd={props.chatTransclusionToAdd}
            unitEnter={(pos, content) => {
                setLastPosted({ pith: content, id: uuidv4(), temporary: true });
                props.addPost(content);
            }}
        />
    );
    return (
        <ChatLayout loading={props.loading} editor={editor}>
            {postList}
        </ChatLayout>
    );
};

export default Chat;
