import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { parseTime } from "../utils/parseTime";
import { parseLinks } from "../utils/parseLinks";

import ChatScroller from "./ChatScroller";

import ChatLayout from "./ChatLayout";
import PostUnitLayout from "./PostUnitLayout";
import PostLayout from "./PostLayout";
import Unit from "./Unit";
import TextEditor from "./TextEditor";

const Chat = (props) => {
    const [currentlyActive, setCurrentlyActive] = useState({
        id: null,
        num: null,
    });

    const [lastPosted, setLastPosted] = useState({});
    const [postContent, setPostContent] = useState({
        posts: props.posts,
        content: props.content,
    });

    let { content, posts } = postContent;

    const postGroups = [];

    useEffect(() => {
        if (props.postPending && !posts.includes(lastPosted.id)) {
            // if a post is pending, add the temporary post to the list of posts
            const newContent = { ...content };
            newContent[lastPosted.id] = lastPosted;
            const newPosts = [...posts];
            newPosts.push(lastPosted.id);
            setPostContent({ posts: newPosts, content: newContent });
        } else if (!props.postPending && posts.includes(lastPosted.id)) {
            setPostContent({ posts: props.posts, content: props.content });
        } else {
            // TODO: rather than copy props to state, switch which we render depending on if we're
            // loading or not
            setPostContent({ posts: props.posts, content: props.content });
        }
    }, [props.posts, props.content, props.postPending]);

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
        meta.push({
            date: parseTime(group[0].createdAt),
            author: group[0].author,
        });
    }

    // add the referenced posts to the groups
    for (const i in postGroups) {
        const group = postGroups[i];
        let totalNumAdded = 0;
        for (const j in group) {
            let adjustedInd = parseInt(j) + totalNumAdded;
            const links = parseLinks(postGroups[i][adjustedInd].pith).reverse();

            // set the unit's starting position for any references it contains
            postGroups[i][adjustedInd].startingRef = totalNumAdded;

            for (const k in links) {
                const link = links[k];

                const obj = {
                    ...content[link],
                    id: `${group[adjustedInd].id}-${link}`,
                    transcluded: true,
                    transcludeNum: links.length - k + totalNumAdded,
                    totalTranscluded: links.length,
                };

                postGroups[i].splice(adjustedInd, 0, obj);
            }
            totalNumAdded += links.length;
            // postGroups[i][
            //     adjustedInd + links.length
            // ].numTransclusionsInGroup = totalNumAdded;
        }
    }

    const postList = postGroups.map((group, i) => {
        let realPosition = 0;
        const units = group.map((post, j) => {
            const unit = (
                <Unit
                    chat
                    id={post.id}
                    pith={post.pith}
                    transcludeNum={post.transcludeNum}
                    transclusionStartingRef={post.startingRef}
                    transcluded={post.transcluded}
                    transcludeHoverActive={
                        post.transcluded
                            ? post.id.includes(currentlyActive.id) &&
                              currentlyActive.num === post.transcludeNum
                            : false
                    }
                    linkHovered={(num) => {
                        setCurrentlyActive({
                            id: post.id,
                            num: num,
                        });
                    }}
                    linkUnhovered={() => {
                        setCurrentlyActive({ id: null, num: null });
                    }}
                />
            );
            if (post.transcludeNum !== undefined) realPosition++;
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
                setLastPosted({
                    pith: content,
                    id: uuidv4(),
                    temporary: true,
                    author: props.nickname || "you",
                    createdAt: new Date().toISOString(),
                });
                props.addPost(content);
            }}
        />
    );

    const scroller = (
        <ChatScroller
            numPosts={posts.length}
            tempPost={props.posts.length !== posts.length}
        >
            {postList}
        </ChatScroller>
    );
    return (
        <ChatLayout
            empty={postList.length === 0}
            loading={props.loading}
            editor={editor}
            scroller={scroller}
        />
    );
};

export default Chat;
