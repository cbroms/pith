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

    grid-template-rows: [drag-marker] 5px [drag-marker-end content] 1fr ${(
            props
        ) =>
            props.last
                ? "[content-end end-drag-marker] 5px [end-drag-marker-end]"
                : "[content-end]"};
`;
const StyledUnit = styled.div`
    box-sizing: border-box;
    grid-column-start: unit;
    grid-column-end: unit-end;
    grid-row-start: content;
    grid-row-end: content-end;

    border: ${(props) =>
        props.over
            ? "1px solid " + props.theme.shade3
            : "1px solid transparent"};

    :active {
        cursor: grabbing;
    }
`;

const StyledEnter = styled.div`
    grid-column-start: open;
    grid-column-end: open-end;
    grid-row-start: content;
    grid-row-end: content-end;
`;

const StyledDragMarker = styled.div`
    box-sizing: border-box;
    grid-column-start: unit;
    grid-column-end: open-end;
    grid-row-start: drag-marker;
    grid-row-end: drag-marker-end;

    background-color: ${(props) =>
        props.over ? props.theme.shade3 : "inherit"};
`;

const StyledEndDragMarker = styled.div`
    box-sizing: border-box;
    grid-column-start: unit;
    grid-column-end: open-end;
    grid-row-start: end-drag-marker;
    grid-row-end: end-drag-marker-end;

    background-color: ${(props) =>
        props.over ? props.theme.shade3 : "inherit"};
`;

const StyledEnterButton = styled(Button)`
    margin: 5px auto;
    display: block;
`;

const StyledToggleButton = styled(Button)`
    margin-top: 15px;
`;

const DocumentSectionLayout = (props) => {
    const [isOpen, toggleOpen] = useState(props.level !== 2);

    const toggleButton =
        props.level === 2 ? (
            <StyledToggleButton
                onClick={() => toggleOpen(!isOpen)}
                noBackground
            >
                {isOpen ? <DownChevron /> : <RightChevron />}
            </StyledToggleButton>
        ) : null;

    const enterButton =
        props.level > 1 ? (
            <StyledEnterButton onClick={() => console.log("open")} noBackground>
                <RightDoubleChevron />
            </StyledEnterButton>
        ) : null;

    return (
        <StyledContainer level={props.level}>
            <StyledUnitContainer level={props.level}>
                <StyledToggle>{toggleButton}</StyledToggle>
                <StyledUnitAndEnter last={props.last}>
                    <StyledDragMarker
                        draggable
                        over={
                            props.over && !props.overAtEnd && !props.overAsChild
                        }
                        onDragOver={props.onDragOver}
                        onDragEnter={(e) => props.onDragEnter(e, false, false)}
                    />
                    <StyledUnit
                        onDragEnter={(e) => props.onDragEnter(e, true, false)}
                        draggable
                        onDragOver={props.onDragOver}
                        onDragStart={props.onDragStart}
                        onDragEnd={props.onDragEnd}
                        over={props.over && props.overAsChild}
                    >
                        {props.pith}
                    </StyledUnit>
                    <StyledEnter>{enterButton}</StyledEnter>
                    {props.last ? (
                        <StyledEndDragMarker
                            draggable
                            over={props.over && props.overAtEnd}
                            onDragOver={props.onDragOver}
                            onDragEnter={(e) =>
                                props.onDragEnter(e, false, true)
                            }
                        />
                    ) : null}
                </StyledUnitAndEnter>
            </StyledUnitContainer>
            {isOpen ? props.children : null}
        </StyledContainer>
    );
};

export default DocumentSectionLayout;
