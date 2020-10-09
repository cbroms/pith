import React, { useState } from "react";
import styled from "styled-components";

import { MoveRightChevron } from "./Symbols";
import { Button } from "./StandardUI";

const StyledUnitContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: [ unit] 1fr [unit-end move] 40px [move-end];
    grid-template-rows: [content] 1fr [content-end];

    background-color: ${(props) =>
        props.transcluded ? props.theme.backgroundColor2 : "inherit"};
    font-style: ${(props) => (props.transcluded ? "italic" : "inherit")};
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
    padding: 0 10px;
    justify-self: end;
`;

const PostUnitLayout = (props) => {
    return (
        <StyledUnitContainer transcluded={props.transcluded}>
            <StyledUnit>{props.unit}</StyledUnit>
            <StyledMoveButton>
                <Button onClick={() => console.log("open")} noBackground>
                    <MoveRightChevron />
                </Button>
            </StyledMoveButton>
        </StyledUnitContainer>
    );
};

export default PostUnitLayout;
