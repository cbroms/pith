import React, { useState } from "react";
import styled from "styled-components";

import { DownChevron, RightChevron, RightDoubleChevron } from "./Symbols";
import { Button } from "./StandardUI";

const StyledContainer = styled.div`
    margin-left: ${(props) => (props.level === 3 ? 60 : 0)}px;
`;

const StyledUnitContainer = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: [toggle] ${(props) => (props.level === 2 ? 30 : 0)}px [toggle-end unit] 1fr [unit-end];
    grid-template-rows: [content] 1fr [content-end];
    margin: 5px 0;
`;

const StyledToggle = styled.div`
    grid-column-start: toggle;
    grid-column-end: toggle-end;
    grid-row-start: content;
    grid-row-end: content-end;
    color: ${(props) => props.theme.shade2};
`;

const StyledUnitAndEnter = styled.div`
    box-sizing: border-box;
    grid-column-start: toggle-end;
    grid-column-end: enter-end;
    grid-row-start: content;
    grid-row-end: content-end;

    display: grid;
    width: 100%;
    grid-template-columns: [unit] 1fr [unit-end open] 40px [open-end];
    grid-template-rows: [content] 1fr [content-end];

    border: 1px solid transparent;
    :hover {
        border: 1px solid ${(props) => props.theme.shade2};
    }
`;
const StyledUnit = styled.div`
    box-sizing: border-box;
    grid-column-start: unit;
    grid-column-end: unit-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const StyledEnter = styled.div`
    grid-column-start: open;
    grid-column-end: open-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const StyledButton = styled(Button)`
    margin: 5px auto;
    display: block;
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
            <StyledButton onClick={() => console.log("open")} noBackground>
                <RightDoubleChevron />
            </StyledButton>
        ) : null;

    return (
        <StyledContainer level={props.level}>
            <StyledUnitContainer level={props.level}>
                <StyledToggle>{toggleButton}</StyledToggle>
                <StyledUnitAndEnter>
                    <StyledUnit>{props.pith}</StyledUnit>
                    <StyledEnter>{enterButton}</StyledEnter>
                </StyledUnitAndEnter>
            </StyledUnitContainer>
            {isOpen ? props.children : null}
        </StyledContainer>
    );
};

export default DocumentSectionLayout;
