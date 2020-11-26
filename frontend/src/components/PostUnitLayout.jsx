import React from "react";
import styled from "styled-components";

import { SmallRightArrow, SmallDownArrow } from "./Symbols";
import { Button } from "./StandardUI";

const StyledUnitContainer = styled.div`
box-sizing: border-box;
    display: grid;
    width: 100%;
    grid-template-columns: [ unit] 1fr [unit-end actions] 110px [actions-end];
    grid-template-rows: [content] 1fr [content-end];
    margin-top: ${(props) => (props.topTransclude ? 5 : 0)}px;
    margin-bottom: ${(props) => (props.bottomTransclude ? 5 : 0)}px;

    padding-left: ${(props) =>
        props.transcluded ? (props.transcludeHoverActive ? 20 : 10) : 0}px;

    font-style: ${(props) => (props.transcluded ? "italic" : "inherit")};

    color: ${(props) => (props.greyed ? props.theme.shade2 : "inherit")};
    border-top: 1px solid transparent;

    
    border-left: 1px solid ${(props) =>
        props.transcluded ? props.theme.shade2 : "transparent"};


    transition: padding-left ${(props) => props.theme.fastAnimation};

    :hover {
        border-top: 1px solid ${(props) => props.theme.shade2};
        border-left: 1px solid ${(props) => props.theme.shade2};
        padding-left: 10px;
    }

    ${(props) =>
        props.actionsVisible
            ? `
        .actions {
            visibility: visible;
        }
    `
            : `:hover {
        .actions {
            visibility: visible;
        }
    }`}

   // max-width: ${(props) => (props.down ? "350px" : "100%")};
`;

const StyledUnit = styled.div`
    grid-column-start: unit;
    grid-column-end: unit-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const StyledActionsContainer = styled.div`
    grid-column-start: actions;
    grid-column-end: actions-end;
    grid-row-start: content;
    grid-row-end: content-end;
    width: 100%;
    visibility: hidden;

    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
`;

const StyledActionButton = styled(Button)`
    padding: 0 5px;
`;

const StyledActionText = styled.span`
    font-size: ${(props) => props.theme.smallFont};
`;

const StyledMoveRight = styled(SmallRightArrow)`
    display: inline-block;
`;

const StyledMoveDown = styled(SmallDownArrow)`
    display: inline-block;
`;

const PostUnitLayout = (props) => {
    return (
        <StyledUnitContainer
            actionsVisible={props.actionsVisible}
            greyed={props.greyed}
            transcluded={props.transcluded}
            transcludeHoverActive={props.transcludeHoverActive}
            topTransclude={props.topTransclude}
            bottomTransclude={props.bottomTransclude}
        >
            <StyledUnit>{props.unit}</StyledUnit>
            <StyledActionsContainer className="actions">
                {props.onReply ? (
                    <StyledActionButton onClick={props.onReply} noBackground>
                        <StyledActionText>Reply</StyledActionText>
                    </StyledActionButton>
                ) : null}
                {props.onMove ? (
                    <StyledActionButton onClick={props.onMove} noBackground>
                        {props.down ? (
                            <StyledActionText>
                                {props.moveActionTitle} <StyledMoveDown />
                            </StyledActionText>
                        ) : (
                            <StyledActionText>
                                {props.moveActionTitle} <StyledMoveRight />
                            </StyledActionText>
                        )}
                    </StyledActionButton>
                ) : null}
            </StyledActionsContainer>
        </StyledUnitContainer>
    );
};

export default PostUnitLayout;
