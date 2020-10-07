import React, { useState } from "react";
import styled from "styled-components";

import { DownChevron, RightChevron, RightDoubleChevron } from "./Symbols";
import { Button } from "./StandardUI";

const StyledContainer = styled.div`
    margin-left: ${(props) =>
        props.level === 3 ? 60 : props.level === 2 ? 20 : 0}px;
`;

const StyledUnitContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: [toggle] ${(props) => (props.level === 2 ? 30 : 0)}px [toggle-end unit] 1fr [unit-end enter] 40px [enter-end];
    grid-template-rows: [content] 1fr [content-end];
    margin: 5px 0;
`;

const StyledToggle = styled.div`
    grid-column-start: toggle;
    grid-column-end: toggle-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const StyledUnit = styled.div`
    grid-column-start: unit;
    grid-column-end: unit-end;
    grid-row-start: content;
    grid-row-end: content-end;

    :hover {
        background-color: ${(props) => props.theme.backgroundColor2};
    }
`;

const StyledEnter = styled.div`
    grid-column-start: enter;
    grid-column-end: enter-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const DocumentSectionLayout = (props) => {
    const [isOpen, toggleOpen] = useState(props.level !== 2);

    const toggleButton =
        props.level === 2 ? (
            <Button onClick={() => toggleOpen(!isOpen)} noBackground>
                {isOpen ? <DownChevron /> : <RightChevron />}
            </Button>
        ) : null;

    const enterButton =
        props.level > 1 ? (
            <Button onClick={() => console.log("open")} noBackground>
                <RightDoubleChevron />
            </Button>
        ) : null;

    return (
        <StyledContainer level={props.level}>
            <StyledUnitContainer level={props.level}>
                <StyledToggle>{toggleButton}</StyledToggle>
                <StyledUnit>{props.pith}</StyledUnit>
                <StyledEnter>{enterButton}</StyledEnter>
            </StyledUnitContainer>
            {isOpen ? props.children : null}
        </StyledContainer>
    );
};

export default DocumentSectionLayout;
