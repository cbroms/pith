import React from "react";
import styled from "styled-components";

import { UpChevron, VerticalLine, Dot } from "./Symbols";
import TooltipLayout from "./TooltipLayout";
import Unit from "./Unit";

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const StyledAncestorLayer = styled.div`
    width: 40px;
    cursor: pointer;
    color: ${(props) => props.theme.shade2};

    :hover {
        color: ${(props) => props.theme.shade3};
    }
`;

const AncestorsLayout = (props) => {
    const units = props.ancestors.map((unit, i) => {
        return (
            <span key={unit.unit_id}>
                <StyledAncestorLayer data-tip data-for={`${unit.unit_id}`}>
                    {i !== props.ancestors.length - 1 ? <UpChevron /> : <Dot />}
                    {i !== props.ancestors.length - 1 ? <VerticalLine /> : null}
                </StyledAncestorLayer>
                <TooltipLayout id={unit.unit_id} place="right">
                    <Unit pith={unit.pith} charLimited />
                </TooltipLayout>
            </span>
        );
    });
    return <StyledContainer>{units}</StyledContainer>;
};

export default AncestorsLayout;
