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
    enterUser,
    createUser,
    createPost,
    sendToDoc,
    subscribeUsers,
    subscribeChat,
    subscribeDocument,
} from "../actions/discussionActions";

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

    const { joined, createNickname, joinUser } = props.events;
    const loading = props.events.loadUser.pending;
    const badDiscussion = props.userError.invalidDiscussion;

    const match = useRouteMatch();
    const { discussionId } = useParams();

    useEffect(() => {
        if (!joined && !createNickname && !joinUser.pending && !badDiscussion)
            props.dispatch(enterUser(discussionId));
        else if (joined && !subscribed) {
            props.dispatch(subscribeChat());
            props.dispatch(subscribeUsers());
            props.dispatch(subscribeDocument());
            setSubscribed(true);
        }
    });

    const joinDiscussion = (nickname) => {
        // join the discussion with a given nickname
        props.dispatch(createUser(discussionId, nickname));
    };

    const chat = (
        <Chat
            loading={props.events.loadUser.pending}
            content={props.chatMap}
            posts={props.posts}
            openSearch={() => setChatSearchOpen(true)}
            closeSearch={() => setChatSearchOpen(false)}
            setQuery={(query) => setQuery(query)}
            addPost={(content) => {
                console.log("posted:", content);
                props.dispatch(props.createPost(content));
            }}
            sendPostToDoc={(id) => {
                console.log("moved:", id);
                props.dispatch(sendToDoc(id));
            }}
        />
    );

    const doc = (
        <Document
            loading={props.events.loadUser.pending}
            units={props.docMap}
            ancestors={props.ancestors}
            currentUnit={props.currentUnit}
            users={props.icons}
            timeline={props.timeline}
        />
    );
    const search = <Search query={query} />;
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
                            badNickname={
                                props.userError.createUser.takenNickname
                            }
                            badDiscussion={badDiscussion}
                            onComplete={(nickname) => joinDiscussion(nickname)}
                            id={discussionId}
                            loadingScreen={props.events.loadUser.pending}
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
                            search={search}
                            searchActive={chatSearchOpen}
                        />
                    )}
                </Route>
            </Switch>
        </Router>
    );
};

export default Discussion;
