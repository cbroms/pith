import React, { useState } from "react";
import styled from "styled-components";

import { MediumHeading } from "./StandardUI";
import { MenuIcon, CloseIcon } from "./Symbols";

const StyledContent = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1.25fr [document-end];
    grid-template-rows: [header] 40px [header-end content] 1fr [content-end];

    @media (max-width: 768px) {
        grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1fr [document-end];
        grid-template-rows:
            [header] 40px [header-end content] 1fr
            [content-end];
    }

    max-height: 100%;
    max-width: 2000px;
    margin: 0 auto;

    flex: 1 1 auto;

    z-index: 1;
`;

const StyledHeaderLogo = styled.div`
    grid-column-start: logo;
    grid-column-end: logo-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 0;
    z-index: 20;

    @media (max-width: 768px) {
        background-color: ${(props) => props.theme.shade1};
        border-bottom: 1px solid
            ${(props) => (props.active ? "transparent" : props.theme.shade2)};
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

    z-index: 20;

    border-left: 1px solid ${(props) => props.theme.shade2};
    border-bottom: 1px solid
        ${(props) => (!props.active ? "transparent" : props.theme.shade2)};
    display: ${(props) => (props.menuActive ? "none" : "block")};

    @media (min-width: 768px) {
        display: none;
    }
`;

const StyledHeaderDocument = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: header-end;
    padding: 10px 20px;

    z-index: 20;

    border-left: 1px solid ${(props) => props.theme.shade2};
    border-bottom: 1px solid
        ${(props) => (!props.active ? "transparent" : props.theme.shade2)};

    @media (max-width: 768px) {
        display: ${(props) => (props.menuActive ? "none" : "block")};
    }

    @media (min-width: 768px) {
        display: none;
    }
`;

const StyledMenuContainer = styled.div`
    box-sizing: border-box;
    transition: max-width ${(props) => props.theme.animation};

    padding: 10px;
    grid-column-start: logo;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: content-end;
    z-index: 10;
    max-width: ${(props) => (props.active ? "100%" : "40px")};

    @media (max-width: 768px) {
        grid-column-end: ${(props) => (props.active ? "document-end" : "logo")};
        display: ${(props) => (props.active ? "block" : "none")};
    }

    background-color: ${(props) => props.theme.shade1};
`;

const StyledSearchContainer = styled.div`
    box-sizing: border-box;
    transition: max-height ${(props) => props.theme.animation};

    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: content-end;
    z-index: 10;
    max-height: ${(props) => (props.active ? "100%" : "0px")};

    background-color: ${(props) => props.theme.shade1};
`;

const StyledSearchContent = styled.div`
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    transition: opacity ${(props) => props.theme.animation};
    opacity: ${(props) => (props.active ? 1 : 0)};

    @media (min-width: 768px) {
        border-right: 1px solid ${(props) => props.theme.shade2};
    }
`;

const StyledMenuContent = styled.div`
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    transition: opacity ${(props) => props.theme.animation};
    opacity: ${(props) => (props.active ? 1 : 0)};

    @media (min-width: 768px) {
        border-right: 1px solid ${(props) => props.theme.shade2};
    }
`;

const StyledDiscussionContainer = styled.div`
    display: ${(props) => (props.active ? "block" : "none")};

    @media (min-width: 768px) {
        display: block;
    }
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: content-end;

    padding: 10px;
    z-index: 5;
    background-color: ${(props) => props.theme.shade1};

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
        grid-row-start: content;
        grid-row-end: content-end;
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
    grid-row-start: header;
    grid-row-end: content-end;
    padding: 10px;
    z-index: 0;

    background-color: ${(props) => props.theme.shade1};

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
        grid-row-start: content;
        grid-row-end: content-end;
    }
`;

const StyledTitle = styled(MediumHeading)`
    margin: 0;
    color: ${(props) =>
        props.active ? props.theme.shade3 : props.theme.shade2};

    @media (min-width: 768px) {
        color: ${(props) => props.theme.shade2};
    }
`;

const DiscussionLayout = (props) => {
    const [discussionActive, setDiscussionActive] = useState(true);
    const [menuActive, setMenuActive] = useState(false);

    return (
        <StyledContent>
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
                <StyledTitle active={discussionActive}>Chat</StyledTitle>
            </StyledHeaderDiscussion>
            <StyledHeaderDocument
                menuActive={menuActive}
                active={discussionActive}
                onClick={(e) => setDiscussionActive(false)}
            >
                <StyledTitle active={!discussionActive}>Doc</StyledTitle>
            </StyledHeaderDocument>
            <StyledMenuContainer active={menuActive}>
                <StyledMenuContent active={menuActive}>
                    {props.menu}
                </StyledMenuContent>
            </StyledMenuContainer>
            <StyledSearchContainer active={props.searchActive}>
                <StyledSearchContent active={props.searchActive}>
                    {props.search}
                </StyledSearchContent>
            </StyledSearchContainer>
            <StyledDocumentContainer>{props.document}</StyledDocumentContainer>
            <StyledDiscussionContainer active={discussionActive}>
                <StyledDiscussionContent menuActive={menuActive}>
                    {props.chat}
                </StyledDiscussionContent>
            </StyledDiscussionContainer>
        </StyledContent>
    );
};

export default DiscussionLayout;
