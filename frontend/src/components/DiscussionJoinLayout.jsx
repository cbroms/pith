import React from "react";
import styled from "styled-components";

import { LargeHeading, Paragraph } from "./StandardUI";

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
    margin: 0 auto;

    position: relative;
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

const DiscussionJoinLayout = (props) => {
    return (
        <StyledContainer>
            {props.joiningScreen ? (
                <StyledContent>
                    <LargeHeading>Joining discussion...</LargeHeading>
                </StyledContent>
            ) : (
                <StyledContent>
                    <LargeHeading>Create a nickname</LargeHeading>
                    <Paragraph>
                        Your nickname will be used to identify your
                        contributions in the discussion.
                    </Paragraph>
                    {props.done ? (
                        <Paragraph>joining as "{props.nickname}"...</Paragraph>
                    ) : (
                        props.editor
                    )}
                </StyledContent>
            )}
        </StyledContainer>
    );
};

export default DiscussionJoinLayout;
