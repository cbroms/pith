import React from "react";
import styled from "styled-components";

const StyledIcon = styled.div`
    position: relative;
    display: inline-block;
    width: 25px;
    height: 25px;
    font-size: ${(props) => props.theme.smallFont};
    font-family: ${(props) => props.theme.sans};

    // ::after,
    ::before {
        content: "${(props) => (props.referenceNum ? props.referenceNum : "")}";
        display: block;
        position: absolute;
        width: 15px;
        height: 10px;
        border-top: ${(props) => (props.forward ? "2px solid" : "none")};
        border-right: ${(props) => (props.forward ? "2px solid" : "none")};
        border-left: ${(props) => (props.backward ? "2px solid" : "none")};
        border-bottom: ${(props) => (props.backward ? "2px solid" : "none")};
        top: 4px;
        left: 4px;
    }
    
    color: ${(props) => props.theme.standardTextColor};

    :hover {
        background-color: ${(props) => props.theme.hoveredBackroundColor};
    }
`;

export const LinkIcon = ({ backward, forward, referenceNum }) => {
    // link can be either forward or backward
    return (
        <StyledIcon
            backward={backward}
            forward={forward}
            referenceNum={referenceNum}
        />
    );
};

export default LinkIcon;
