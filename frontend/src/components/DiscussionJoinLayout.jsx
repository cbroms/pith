import React from "react";
import styled from "styled-components";

import { LargeHeading, MediumHeading, Paragraph } from "./StandardUI";

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1.25fr [document-end];
    grid-template-rows: [header] 40px [header-end content] 1fr [content-end];

    @media (max-width: 768px) {
        grid-template-columns: [logo] 40px [logo-end discussion] 1fr [discussion-end document] 1fr [document-end];
        grid-template-rows:
            [header] 40px [header-end content] c1fr
            [content-end];
    }

    max-width: 2000px;

    flex: 1 1 auto;

    background-color: ${(props) => props.theme.shade1};
    z-index: 2;
`;

const StyledContent = styled.div`
    grid-column-start: discussion;
    grid-column-end: discussion-end;
    grid-row-start: content;
    grid-row-end: content-end;

    @media (max-width: 768px) {
        grid-column-start: logo;
        grid-column-end: document-end;
        grid-row-start: content;
        grid-row-end: content-end;
    }

    padding: 10px;

    width: 100%;
    justify-self: right;
    max-width: 450px;
`;

const StyledErrorHeader = styled(MediumHeading)`
    font-size: 1.25rem;
    display: inline-block;
    font-family: monospace;
    margin: 0;
    margin-right: 20px;
`;

const StyledErrorParagraph = styled(Paragraph)`
    display: inline-block;
    margin: 0;
`;

const StyledError = styled(Paragraph)`
    color: ${(props) => props.theme.errorShade};
`;

const DiscussionJoinLayout = (props) => {
    let view = (
        <StyledContent>
            <LargeHeading>Create a nickname</LargeHeading>
            <Paragraph>
                Your nickname will be used to identify your contributions in the
                discussion.
            </Paragraph>
            {props.done ? (
                <Paragraph>joining as "{props.nickname}"...</Paragraph>
            ) : (
                props.editor
            )}
            {props.badNickname ? (
                <StyledError>"{props.nickname}" is already taken.</StyledError>
            ) : null}
        </StyledContent>
    );

    if (props.badDiscussion) {
        view = (
            <StyledContent>
                <StyledErrorHeader>404</StyledErrorHeader>
                <StyledErrorParagraph>
                    That discussion doesn't exist.
                </StyledErrorParagraph>
            </StyledContent>
        );
    } else if (props.joiningScreen && !props.loadingScreen) {
        view = (
            <StyledContent>
                <LargeHeading>Joining discussion...</LargeHeading>
            </StyledContent>
        );
    } else if (props.loadingScreen) {
        view = (
            <StyledContent>
                <LargeHeading>Loading discussion...</LargeHeading>
            </StyledContent>
        );
    }
    return <StyledContainer>{view}</StyledContainer>;
};

export default DiscussionJoinLayout;
