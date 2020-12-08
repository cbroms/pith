import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useRouteMatch,
    useParams,
} from "react-router-dom";

import { withRouter } from "react-router";
import {
    GENERIC_ERROR,
    INVALID_DISCUSSION,
    NO_USER_ID,
    TAKEN_NICKNAME,
    TAKEN_USER_ID,
} from "../utils/errors";

import {
    enterDiscussion,
    createUser,
    joinUser,
    createPost,
    getPage,
    sendToDoc,
    search,
    subscribeChat,
    subscribeDocument,
} from "../actions/discussionActions";

import { createCitation } from "../utils/pithModifiers";

import useRequest from "../hooks/useRequest";

import Chat from "./Chat";
import DocumentContextController from "./DocumentContextController";
import Menu from "./Menu";
import Search from "./Search";
import DiscussionJoin from "./DiscussionJoin";
import SystemError from "./SystemError";

import DiscussionLayout from "./DiscussionLayout";

const Discussion = (props) => {
    const [searchOpen, setSearchOpen] = useState({ open: false, side: null });

    const [subscribed, setSubscribed] = useState(false);
    const [transclusion, setTransclusion] = useState(null);
    const [query, setQuery] = useState("");

    // request hooks
    const [enterDiscussionStatus, makeEnterDiscussion] = useRequest(
        props.completedRequests
    );
    const [createUserStatus, makeCreateUser] = useRequest(
        props.completedRequests
    );
    const [joinUserStatus, makeJoinUser] = useRequest(props.completedRequests);
    const [getPageStatus, makeGetPage] = useRequest(props.completedRequests);
    const [postStatus, makePost] = useRequest(props.completedRequests);
    const [getContextStatus, makeGetContext] = useRequest(
        props.completedRequests
    );
    const [searchStatus, makeSearch] = useRequest(props.completedRequests);
    // create status vars for convenience
    const joined = joinUserStatus.made && !joinUserStatus.pending;
    const loading =
        joinUserStatus.pending || getPageStatus.pending || !getPageStatus.made;

    const badDiscussion = enterDiscussionStatus.status === INVALID_DISCUSSION;
    const createNickname = enterDiscussionStatus.status === NO_USER_ID;
    const badNickname = createUserStatus.status === TAKEN_NICKNAME;

    const match = useRouteMatch();
    const { discussionId } = useParams();

    useEffect(() => {
        if (!enterDiscussionStatus.made) {
            // we have yet to enter the discussion, so do that now
            makeEnterDiscussion((requestId) =>
                props.dispatch(enterDiscussion(discussionId, requestId))
            );
        } else if (
            !enterDiscussionStatus.pending &&
            !badDiscussion &&
            !joined &&
            !joinUserStatus.pending
        ) {
            // we're done entering the discussion and it's a valid id and we have not yet
            // tried to join with the user
            if (
                enterDiscussionStatus.status === null ||
                createUserStatus.status === null
            ) {
                // if we entered the discussion and it indicated we have a userId already,
                // go ahead and join. Do the same if we just created a nickname sucessfully.
                makeJoinUser((requestId) =>
                    props.dispatch(joinUser(discussionId, requestId))
                );
            }
        } else if (joined && !getPageStatus.made) {
            // we've fully joined, now load the unit
            makeGetPage((requestId) =>
                props.dispatch(getPage(props.currentUnit, requestId))
            );
        } else if (joined && !subscribed) {
            // fully loaded now, so we can subscribe
            props.dispatch(subscribeChat(uuidv4()));
            props.dispatch(subscribeDocument(uuidv4()));
            setSubscribed(true);
        }
    });

    const joinDiscussion = (nickname) => {
        // join the discussion with a given nickname
        makeCreateUser((requestId) =>
            props.dispatch(createUser(discussionId, nickname, requestId))
        );
    };

    const getUnitContext = (id) => {
        // get a unit's pith (should only be called if the unit is not in the map already)
        makeGetContext((requestId) => {
            props.dispatch(getPage(id, requestId));
        });
    };

    const chat = (
        <Chat
            loading={loading}
            content={props.chatMap}
            posts={props.posts}
            openSearch={() => {
                setSearchOpen({ side: "doc", open: true });
                setTransclusion(null);
                setQuery("");
            }}
            closeSearch={() => setSearchOpen({ side: "doc", open: false })}
            setQuery={(query) => {
                console.log("searching for:", query);
                makeSearch((requestId) => {
                    props.dispatch(search(query, requestId));
                });
                setQuery({ query: query, id: null });
            }}
            postPending={postStatus.pending}
            nickname={props.icons[props.userId]?.nickname}
            addPost={(content) => {
                console.log("posted:", content);
                makePost((requestId) =>
                    props.dispatch(createPost(content, requestId))
                );
            }}
            getUnitContext={getUnitContext}
            gettingUnitContext={getContextStatus.pending}
            sendPostToDoc={(id) => {
                console.log("moved:", id);
                props.dispatch(sendToDoc(id, uuidv4()));
            }}
            transclusionToAdd={
                searchOpen.side === "doc" ? transclusion?.content : null
            }
        />
    );

    const doc = (
        <DocumentContextController
            {...props}
            transclusionToAdd={
                searchOpen.side === "chat" ? transclusion?.content : null
            }
            transclusionUnitId={transclusion?.unitId}
            loading={loading}
            openUnit={(id) => {
                console.log("opened:", id);
                props.dispatch(getPage(id, uuidv4()));
            }}
            openSearch={() => {
                setSearchOpen({ side: "chat", open: true });
                setTransclusion(null);
                setQuery("");
            }}
            closeSearch={() => setSearchOpen({ side: "chat", open: false })}
            setQuery={(query, unitId) => {
                console.log("searching for:", query);
                makeSearch((requestId) => {
                    props.dispatch(search(query, requestId));
                });
                setQuery({ query: query, id: unitId });
            }}
            getUnitContext={getUnitContext}
            gettingUnitContext={getContextStatus.pending}
        />
    );
    const searchComp = (
        <Search
            query={query.query || ""}
            forChat={searchOpen.side === "doc"}
            searching={searchStatus.pending}
            docResults={props.searchResults.doc}
            chatResults={props.searchResults.chat}
            docUnits={props.docMap}
            chatUnits={props.chatMap}
            selectUnit={(id) => {
                setTransclusion({
                    content: createCitation(id),
                    unitId: query.id,
                });
                setSearchOpen({ ...searchOpen, open: false });
            }}
        />
    );
    const menu = <Menu setDarkMode={props.setDarkMode} />;

    return (
        <Router>
            <SystemError
                error={props.systemError}
                timeout={props.requestTimeout}
            />
            <Switch>
                <Route path={`${match.path}/join`}>
                    {joined ? (
                        <Redirect
                            to={{
                                pathname: `/d/${discussionId}`,
                            }}
                        />
                    ) : (
                        <DiscussionJoin
                            badNickname={badNickname}
                            badDiscussion={badDiscussion}
                            onComplete={(nickname) => joinDiscussion(nickname)}
                            id={discussionId}
                            loadingScreen={joinUserStatus.pending}
                        />
                    )}
                </Route>
                <Route path={match.path}>
                    {!joined && createNickname && !badDiscussion ? (
                        <Redirect
                            to={{
                                pathname: `/d/${discussionId}/join`,
                            }}
                        />
                    ) : !joined || loading || badDiscussion ? (
                        <DiscussionJoin
                            badDiscussion={badDiscussion}
                            joiningScreen={!joined}
                            loadingScreen={loading}
                        />
                    ) : (
                        <DiscussionLayout
                            chat={chat}
                            document={doc}
                            menu={menu}
                            search={searchComp}
                            searchOpen={searchOpen.open}
                            searchSide={searchOpen.side}
                        />
                    )}
                </Route>
            </Switch>
        </Router>
    );
};

export default withRouter(Discussion);
