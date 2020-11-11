import React from "react";
import styled from "styled-components";

import { UpChevron, VerticalLine, Dot } from "./Symbols";
import TooltipLayout from "./TooltipLayout";
import UnitContext from "./UnitContext";

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
        if (unit !== props.currentUnit) {
            return (
                <span key={unit} onClick={() => props.openUnit(unit)}>
                    <StyledAncestorLayer data-tip data-for={`${unit}`}>
                        {i !== props.ancestors.length - 1 ? (
                            <UpChevron />
                        ) : (
                            <Dot />
                        )}
                        {i !== props.ancestors.length - 1 ? (
                            <VerticalLine />
                        ) : null}
                    </StyledAncestorLayer>
                    <TooltipLayout
                        id={unit}
                        place="right"
                        getContent={() => (
                            <UnitContext
                                id={unit}
                                units={props.units}
                                getUnitContext={props.getUnitContext}
                                gettingUnitContext={props.gettingUnitContext}
                            />
                        )}
                    ></TooltipLayout>
                </span>
            );
        }
        return null;
    });
    return <StyledContainer>{units}</StyledContainer>;
};

export default AncestorsLayout;
