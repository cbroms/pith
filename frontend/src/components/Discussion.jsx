import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useRouteMatch,
    useParams,
} from "react-router-dom";

import {
    GENERIC_ERROR,
    INVALID_DISCUSSION,
    NO_USER_ID,
    TAKEN_NICKNAME,
    TAKEN_USER_ID,
} from "../utils/errors";

import { v4 as uuidv4 } from "uuid";
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

import useRequest from "../hooks/useRequest";

import Chat from "./Chat";
import Document from "./Document";
import Menu from "./Menu";
import Search from "./Search";
import DiscussionJoin from "./DiscussionJoin";
import SystemError from "./SystemError";

import DiscussionLayout from "./DiscussionLayout";

const Discussion = (props) => {
    const [chatSearchOpen, setChatSearchOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
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
            openSearch={() => setChatSearchOpen(true)}
            closeSearch={() => setChatSearchOpen(false)}
            setQuery={(query) => {
                console.log("searching for:", query);
                makeSearch((requestId) => {
                    props.dispatch(search(query, requestId));
                });
                setQuery(query);
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
        />
    );

    const doc = (
        <Document
            loading={loading}
            units={props.docMap}
            ancestors={props.ancestors}
            currentUnit={props.currentUnit}
            users={props.icons}
            timeline={props.timeline}
            openUnit={(id) => {
                console.log("opened:", id);
                props.dispatch(getPage(id, uuidv4()));
            }}
            getUnitContext={getUnitContext}
            gettingUnitContext={getContextStatus.pending}
        />
    );
    const searchComp = (
        <Search
            query={query}
            searching={searchStatus.pending}
            docResults={props.searchResults.doc}
            chatResults={props.searchResults.chat}
            docUnits={props.docMap}
            chatUnits={props.chatMap}
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
                            searchActive={chatSearchOpen}
                        />
                    )}
                </Route>
            </Switch>
        </Router>
    );
};

export default Discussion;
