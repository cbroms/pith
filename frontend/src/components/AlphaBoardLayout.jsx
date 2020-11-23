import React, { useState } from "react";
import styled from "styled-components";

import { LargeHeading, MediumHeading, Paragraph, Button } from "./StandardUI";

import { RightArrow } from "./Symbols";

const StyledContent = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1.25fr [document-end];
    grid-template-rows: [header] 40px [header-end content] 1fr [content-end footer] 40px [footer-end];

    @media (max-width: 768px) {
        grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1fr [document-end];
        grid-template-rows:
            [header] 40px [header-end content] 1fr
            [content-end footer] 40px [footer-end];
    }

    width: 100%;

    max-width: 2000px;
    margin: 0 auto;

    flex: 1 1 auto;

    z-index: 1;

    a {
        color: ${(props) => props.theme.shade3};
    }

    a:visited {
        color: ${(props) => props.theme.shade2};
    }
`;

const StyledIntroContainer = styled.div`
    @media (min-width: 768px) {
        display: block;
    }
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: header;
    grid-row-end: footer-end;

    padding: 10px;
    z-index: 5;
    background-color: ${(props) => props.theme.shade1};
`;

const StyledDiscussionsContainer = styled.div`
    @media (min-width: 768px) {
        display: block;
    }
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: header;
    grid-row-end: footer-end;

    padding: 10px;
    z-index: 5;
    background-color: ${(props) => props.theme.shade1};
`;

const StyledIntroContent = styled.div`
    height: 100%;
    width: 100%;

    border-right: 1px solid ${(props) => props.theme.shade2};
`;

const StyledCreateContent = styled.div`
    margin-top: 40px;
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
    max-width: 400px;
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

const StyledFooterItem = styled.span`
    display: inline-block;
    margin-right: 15px;
`;

const StyledFooter = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: footer;
    grid-row-end: footer-end;
    align-self: center;
    white-space: nowrap;

    display: flex;
    align-items: center;
    z-index: 10;
`;

const StyledButtonContent = styled.span`
    // margin-right: 10px;
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
                    </StyledButton>
                </StyledIntroContent>
            </StyledIntroContainer>

            <StyledDiscussionsContainer>
                <StyledCreateContent>
                    <MediumHeading>
                        {props.hasDiscussions ? "Your discussions" : ""}
                    </MediumHeading>
                    {props.discussions}
                </StyledCreateContent>
            </StyledDiscussionsContainer>
        </StyledContent>
    );
};

export default AlphaBoardLayout;
