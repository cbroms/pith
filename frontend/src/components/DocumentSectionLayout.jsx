import React, { useState, useEffect, useRef } from "react";
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
    grid-template-rows: [drag-marker] 12px [drag-marker-end content] 1fr [content-end];
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
    grid-template-columns: ${(props) =>
        props.level !== 1
            ? "[grab] 5px [grab-end unit]"
            : "[unit]"} 1fr [unit-end open] 40px [open-end];
    grid-template-rows: [content] 1fr [content-end];

    // :hover {
    //     .grabber {
    //         background-color: ${(props) => props.theme.shade2};
    //     }
    // }
`;

const StyledUnit = styled.div`
    box-sizing: border-box;
    grid-column-start: unit;
    grid-column-end: unit-end;
    grid-row-start: content;
    grid-row-end: content-end;

    font-size: ${(props) =>
        props.level === 1 ? props.theme.largeFont : "inherit"};

    border: ${(props) =>
        props.over
            ? "2px solid " + props.theme.shade3
            : !props.draggable && (props.level !== 1 || props.focused)
            ? "2px solid " + props.theme.shade2
            : "2px solid transparent"};

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

const StyledGrab = styled.div`
    grid-column-start: grab;
    grid-column-end: grab-end;
    grid-row-start: content;
    grid-row-end: content-end;

    cursor: grab;
    height: 100%;

    :active {
        cursor: grabbing;
    }

    border-right: 5px solid ${(props) => props.theme.shade2};

    :hover {
        border-right: 5px solid ${(props) => props.theme.shade3};
    }
`;

const StyledDragMarker = styled.div`
    box-sizing: border-box;
    grid-column-start: toggle;
    grid-column-end: open-end;
    grid-row-start: drag-marker;
    grid-row-end: drag-marker-end;
`;

const StyledEndDragMarker = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 12px;
`;

const StyledDragMarkerLine = styled.div`
    margin: 4px 0;
    height: 3px;
    background-color: ${(props) =>
        props.over ? props.theme.shade3 : "inherit"};
`;

const StyledButton = styled(Button)`
    margin: 5px auto;
    display: block;
`;

const DocumentSectionLayout = (props) => {
    const ref = useRef();

    const [isOpen, toggleOpen] = useState(props.level !== 2);

    useEffect(() => {
        // automatically open the expanded view if a child is added
        if (
            props.level === 2 &&
            props.children.length > 0 &&
            ref.current < props.children.length
        ) {
            toggleOpen(true);
        }
        ref.current = props.children?.length;
    }, [props.children, props.level]);

    const toggleButton =
        props.level === 2 ? (
            <StyledButton onClick={() => toggleOpen(!isOpen)} noBackground>
                {isOpen ? <DownChevron /> : <RightChevron />}
            </StyledButton>
        ) : null;

    const enterButton =
        props.level > 1 ? (
            <StyledButton onClick={() => console.log("open")} noBackground>
                <RightDoubleChevron />
            </StyledButton>
        ) : null;

    return (
        <StyledContainer level={props.level}>
            <StyledUnitContainer level={props.level} last={props.last}>
                <StyledDragMarker
                    draggable={props.draggable}
                    onDragOver={props.onDragOver}
                    onDragEnter={(e) => props.onDragEnter(e, false, false)}
                >
                    <StyledDragMarkerLine
                        over={
                            props.over && !props.overAtEnd && !props.overAsChild
                        }
                    />
                </StyledDragMarker>
                <StyledToggle>{toggleButton}</StyledToggle>
                <StyledUnitAndEnter
                    level={props.level}
                    draggable={props.draggable}
                    onDragStart={props.onDragStart}
                    onDragEnd={props.onDragEnd}
                    onDragOver={props.onDragOver}
                >
                    {props.level !== 1 ? (
                        <StyledGrab className="grabber" level={props.level} />
                    ) : null}
                    <StyledUnit
                        focused={props.focused}
                        level={props.level}
                        onDragEnter={(e) => props.onDragEnter(e, true, false)}
                        draggable={props.draggable}
                        onDragOver={props.onDragOver}
                        over={props.over && props.overAsChild}
                    >
                        {props.pith}
                    </StyledUnit>
                    <StyledEnter>{enterButton}</StyledEnter>
                </StyledUnitAndEnter>
            </StyledUnitContainer>
            {isOpen ? props.children : null}
            {props.last ? (
                <StyledEndDragMarker
                    draggable={props.draggable}
                    onDragOver={props.onDragOver}
                    onDragEnter={(e) => props.onDragEnter(e, false, true)}
                >
                    <StyledDragMarkerLine
                        over={props.over && props.overAtEnd}
                    />
                </StyledEndDragMarker>
            ) : null}
        </StyledContainer>
    );
};

export default DocumentSectionLayout;
