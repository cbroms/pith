import React from "react";
import styled from "styled-components";

import ChatLayout from "./ChatLayout";

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1fr [document-end];
    grid-template-rows: [header] 40px [header-end content] calc(100vh - 40px) [content-end];
    max-height: 100vh;
`;

const StyledHeaderLogo = styled.div`
    grid-column-start: logo;
    grid-column-end: logo-end;
    grid-row-start: header;
    grid-row-end: header-end;
    background-color: red;
`;

const StyledHeaderDiscussion = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: header-end;
    background-color: green;
`;

const StyledHeaderDocument = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: header-end;
    background-color: blue;
`;

const StyledDiscussionContainer = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: content;
    grid-row-end: content-end;
    background-color: cyan;
`;

const StyledDocumentContainer = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: content;
    grid-row-end: content-end;
    background-color: pink;
`;

class DiscussionLayout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <StyledContainer>
                <StyledHeaderLogo />
                <StyledHeaderDiscussion />
                <StyledHeaderDocument />
                <StyledDiscussionContainer>
                    <ChatLayout />
                </StyledDiscussionContainer>
                <StyledDocumentContainer />
            </StyledContainer>
        );
    }
}

export default DiscussionLayout;
