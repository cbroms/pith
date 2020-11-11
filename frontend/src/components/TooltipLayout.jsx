import React from "react";
import styled from "styled-components";

import ReactTooltip from "react-tooltip";

const StyledTooltip = styled(ReactTooltip)`
    &.type-dark {
        box-sizing: border-box;
        background-color: ${(props) => props.theme.shade1};
        border: 1px solid ${(props) => props.theme.shade3};
        color: ${(props) => props.theme.shade3};
        font-size: ${(props) => props.theme.mediumFont};
        pointer-events: auto !important;
        border-radius: 0;
        opacity: 1;
        max-width: 300px;
        width: 100%;

        &:hover {
            visibility: visible !important;
            opacity: 1 !important;
        }

        &::after {
            border: none !important;
        }
    }
`;

const TooltipLayout = (props) => {
    return (
        <StyledTooltip
            clickable
            {...props}
            globalEventOff="click"
            delayHide={0}
            effect="solid"
        >
            {props.children}
        </StyledTooltip>
    );
};

export default TooltipLayout;
