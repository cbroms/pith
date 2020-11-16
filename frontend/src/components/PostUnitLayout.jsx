import React from "react";
import styled from "styled-components";

import { MoveRightChevron, MoveDownChevron } from "./Symbols";
import { Button } from "./StandardUI";

const StyledUnitContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: [ unit] 1fr [unit-end move] 40px [move-end];
    grid-template-rows: [content] 1fr [content-end];
    margin-top: ${(props) => (props.topTransclude ? 5 : 0)}px;
    margin-bottom: ${(props) => (props.bottomTransclude ? 5 : 0)}px;
    font-style: ${(props) => (props.transcluded ? "italic" : "inherit")};

    color: ${(props) => (props.greyed ? props.theme.shade2 : "inherit")};

    ${(props) =>
        props.down
            ? `
        .move {
            visibility: visible;
        }
    `
            : `:hover {
        .move {
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

const StyledMoveButton = styled.div`
    grid-column-start: move;
    grid-column-end: move-end;
    grid-row-start: content;
    grid-row-end: content-end;
    width: 22px;
    visibility: hidden;
`;

const PostUnitLayout = (props) => {
    return (
        <StyledUnitContainer
            down={props.down}
            greyed={props.greyed}
            transcluded={props.transcluded}
            topTransclude={props.topTransclude}
            bottomTransclude={props.bottomTransclude}
        >
            <StyledUnit>{props.unit}</StyledUnit>
            <StyledMoveButton className="move">
                <Button onClick={props.onMove} noBackground>
                    {props.down ? <MoveDownChevron /> : <MoveRightChevron />}
                </Button>
            </StyledMoveButton>
        </StyledUnitContainer>
    );
};

export default PostUnitLayout;
