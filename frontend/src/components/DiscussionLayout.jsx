import React, { useState } from "react";
import styled from "styled-components";

import { LargeHeading } from "./StandardUI";
import { DiscussionIcon, DocumentIcon, MenuIcon, CloseIcon } from "./Symbols";
import Chat from "./Chat";

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1.3fr [document-end];
    grid-template-rows: [header] 40px [header-end content] calc(100vh - 40px) [content-end];

    @media (max-width: 768px) {
        grid-template-columns: [logo] 80px [logo-end discussion] 1fr [discussion-end document] 1fr [document-end];
    }
`;

const StyledHeaderLogo = styled.div`
    grid-column-start: logo;
    grid-column-end: logo-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 0;
    z-index: 20;

    @media (max-width: 768px) {
        background-color: ${(props) =>
            props.active
                ? props.theme.backgroundColor0
                : props.theme.backgroundColor2};
    }

    @media (min-width: 768px) {
        cursor: pointer;
    }
`;

const StyledHeaderDiscussion = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 20px;
    background-color: ${(props) =>
        props.active ? props.theme.backgroundColor2 : "inherit"};

    display: ${(props) => (props.menuActive ? "none" : "block")};

    @media (min-width: 768px) {
        background-color: ${(props) => props.theme.backgroundColor1};
    }
`;

const StyledHeaderDocument = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 20px;

    background-color: ${(props) =>
        props.active ? props.theme.backgroundColor2 : "inherit"};

    @media (max-width: 768px) {
        display: ${(props) => (props.menuActive ? "none" : "block")};
    }

    @media (min-width: 768px) {
        background-color: ${(props) => props.theme.backgroundColor1};
    }
`;

const StyledMenuContainer = styled.div`
    transition: max-width ${(props) => props.theme.animation},
        background-color ${(props) => props.theme.animation};

    grid-column-start: logo;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: content-end;
    z-index: 10;
    max-width: ${(props) => (props.active ? "100%" : "20px")};

    @media (max-width: 768px) {
        // grid-row-start: content;
        grid-column-end: ${(props) => (props.active ? "document-end" : "logo")};
        display: ${(props) => (props.active ? "block" : "none")};
    }

    background-color: ${(props) =>
        props.active
            ? props.theme.backgroundColor0
            : props.theme.backgroundColor1};
`;

const StyledMenuContent = styled.div`
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: ${(props) => (props.active ? 40 : 0)}px;
    transition: opacity ${(props) => props.theme.animation};
    opacity: ${(props) => (props.active ? 1 : 0)};
`;

const StyledDiscussionContainer = styled.div`
    display: ${(props) => (props.active ? "block" : "none")};

    @media (min-width: 768px) {
        display: block;
    }
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: content;
    grid-row-end: content-end;
    padding: 20px;
    z-index: 5;
    background-color: ${(props) => props.theme.backgroundColor1};

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
    }
`;

const StyledDiscussionContent = styled.div`
    height: 100%;
    width: 100%;
    transition: opacity ${(props) => props.theme.animation};
    opacity: ${(props) => (props.menuActive ? 0 : 1)};
`;

const StyledDocumentContainer = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: content;
    grid-row-end: content-end;
    padding: 20px;
    z-index: 0;

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
    }
`;

const StyledTitle = styled(LargeHeading)`
    color: ${(props) =>
        props.active ? props.theme.textColor1 : props.theme.textColor2};

    @media (min-width: 768px) {
        color: ${(props) => props.theme.textColor2};
    }
`;

const DiscussionLayout = (props) => {
    const [discussionActive, setDiscussionActive] = useState(true);
    const [menuActive, setMenuActive] = useState(false);

    return (
        <StyledContainer>
            <StyledHeaderLogo
                active={menuActive}
                onClick={(e) => setMenuActive(!menuActive)}
            >
                {menuActive ? <CloseIcon /> : <MenuIcon />}
            </StyledHeaderLogo>
            <StyledHeaderDiscussion
                menuActive={menuActive}
                active={!discussionActive}
                onClick={(e) => setDiscussionActive(true)}
            >
                {/* <DiscussionIcon />*/}
                <StyledTitle active={discussionActive}>Discuss</StyledTitle>
            </StyledHeaderDiscussion>
            <StyledHeaderDocument
                menuActive={menuActive}
                active={discussionActive}
                onClick={(e) => setDiscussionActive(false)}
            >
                {/* <DocumentIcon />*/}
                <StyledTitle active={!discussionActive}>Document</StyledTitle>
            </StyledHeaderDocument>
            <StyledMenuContainer active={menuActive}>
                <StyledMenuContent active={menuActive} />
            </StyledMenuContainer>
            <StyledDocumentContainer>
                {props.children[1]}
            </StyledDocumentContainer>
            <StyledDiscussionContainer active={discussionActive}>
                <StyledDiscussionContent menuActive={menuActive}>
                    {props.children[0]}
                </StyledDiscussionContent>
            </StyledDiscussionContainer>
        </StyledContainer>
    );
};

export default DiscussionLayout;
