import React, { useState } from "react";
import styled from "styled-components";

import { LargeHeading, Paragraph, Button } from "./StandardUI";

import { RightArrow } from "./Symbols";

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

    width: 100%;

    max-width: 2000px;
    margin: 0 auto;

    flex: 1 1 auto;

    z-index: 1;
`;

const StyledIntroContainer = styled.div`
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
`;

const StyledCreateContainer = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: content-end;
    padding: 10px;
    z-index: 0;
    background-color: ${(props) => props.theme.shade1};
`;

const StyledIntroContent = styled.div`
    height: 100%;
    width: 100%;

    border-right: 1px solid ${(props) => props.theme.shade2};
`;

const StyledTitle = styled(LargeHeading)`
    font-size: 4rem;
    margin-top: 50px;
    margin-right: 5px;
    display: inline-block;
    margin-bottom: 0;
`;

const StyledSuperscript = styled(Paragraph)`
    display: inline-block;
    vertical-align: top;
    margin-top: 50px;
    font-size: 1.75rem;
    font-weight: 300;
    font-style: italic;
`;

const StyledSubtitle = styled(Paragraph)`
    font-size: 1.5rem;
`;

const StyledButton = styled(Button)`
    background-color: ${(props) => props.theme.shade1};
    color: ${(props) => props.theme.shade3};
    border: 1px solid ${(props) => props.theme.shade2};
    margin-top: 45px;

    :hover {
        color: ${(props) => props.theme.shade3};
        background-color: ${(props) => props.theme.shade1};
        border: 1px solid ${(props) => props.theme.shade3};
    }
`;

const StyledButtonContent = styled.span`
    margin-right: 10px;
`;

const AlphaBoardLayout = (props) => {
    return (
        <StyledContent>
            <StyledIntroContainer>
                <StyledIntroContent>
                    <StyledTitle>Pith</StyledTitle>
                    <StyledSuperscript>&alpha;</StyledSuperscript>
                    <StyledSubtitle>
                        An experimental space for productive online discussions.
                    </StyledSubtitle>
                    <StyledButton onClick={props.createDiscussion}>
                        <StyledButtonContent>
                            Create a discussion
                        </StyledButtonContent>
                        <RightArrow />
                    </StyledButton>
                </StyledIntroContent>
            </StyledIntroContainer>
            <StyledCreateContainer />
        </StyledContent>
    );
};

export default AlphaBoardLayout;
