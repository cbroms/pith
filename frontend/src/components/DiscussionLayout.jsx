import React, { useState } from "react";
import styled from "styled-components";

import { LargeHeading } from "./StandardUI";
import { DiscussionIcon, DocumentIcon } from "./Symbols";
import Chat from "./Chat";

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1.25fr [document-end];
    grid-template-rows: [header] 40px [header-end content] calc(100vh - 40px) [content-end];
`;

const StyledHeaderLogo = styled.div`
    grid-column-start: logo;
    grid-column-end: logo-end;
    grid-row-start: header;
    grid-row-end: header-end;
    background-color: ${(props) => props.theme.backgroundColor2};
`;

const StyledHeaderDiscussion = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 10px;
    background-color: ${(props) =>
        props.active ? props.theme.backgroundColor2 : "inherit"};

    @media (max-width: 768px) {
        cursor: pointer;
    }

    @media (min-width: 768px) {
        background-color: ${(props) => props.theme.backgroundColor1};
    }
`;

const StyledHeaderDocument = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 10px;
    background-color: ${(props) =>
        props.active ? props.theme.backgroundColor2 : "inherit"};

    @media (max-width: 768px) {
        cursor: pointer;
    }

    @media (min-width: 768px) {
        background-color: ${(props) => props.theme.backgroundColor1};
    }
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
    padding: 10px 10px;
    z-index: 5;

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
    }
`;

const StyledDocumentContainer = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: content;
    grid-row-end: content-end;
    padding: 10px 10px;
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

    return (
        <StyledContainer>
            <StyledHeaderLogo />
            <StyledHeaderDiscussion
                active={!discussionActive}
                onClick={(e) => setDiscussionActive(true)}
            >
                <DiscussionIcon />
                <StyledTitle active={discussionActive}>Discuss</StyledTitle>
            </StyledHeaderDiscussion>
            <StyledHeaderDocument
                active={discussionActive}
                onClick={(e) => setDiscussionActive(false)}
            >
                <DocumentIcon />
                <StyledTitle active={!discussionActive}>Document</StyledTitle>
            </StyledHeaderDocument>
            <StyledDocumentContainer>
                {props.children[1]}
            </StyledDocumentContainer>
            <StyledDiscussionContainer active={discussionActive}>
                {props.children[0]}
            </StyledDiscussionContainer>
        </StyledContainer>
    );
};

export default DiscussionLayout;
