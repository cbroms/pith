import React from "react";
import styled from "styled-components";

import { UpChevron, VerticalLine, Dot } from "./Symbols";

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const StyledAncestorLayer = styled.div`
    width: 40px;
`;

const AncestorsLayout = (props) => {
    const units = props.ancestors.map((unit, i) => {
        return (
            <StyledAncestorLayer key={unit}>
                {i !== props.ancestors.length - 1 ? <UpChevron /> : <Dot />}
                {i !== props.ancestors.length - 1 ? <VerticalLine /> : null}
            </StyledAncestorLayer>
        );
    });
    return <StyledContainer>{units}</StyledContainer>;
};

export default AncestorsLayout;
