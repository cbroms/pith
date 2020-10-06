import React, { useState } from "react";
import styled from "styled-components";

import { DownChevron, RightChevron } from "./Symbols";
import { Button } from "./StandardUI";

const StyledContainer = styled.div`
    margin-left: ${(props) => (props.level === 1 ? 10 : 40)}px;
`;

const DocumentSectionLayout = (props) => {
    const [isOpen, toggleOpen] = useState(props.level !== 2);

    const toggleButton =
        props.level === 2 ? (
            <Button onClick={() => toggleOpen(!isOpen)} noBackground>
                {isOpen ? <DownChevron /> : <RightChevron />}
            </Button>
        ) : null;

    return (
        <StyledContainer level={props.level}>
            {toggleButton}
            {props.pith}
            {isOpen ? props.children : null}
        </StyledContainer>
    );
};

export default DocumentSectionLayout;
