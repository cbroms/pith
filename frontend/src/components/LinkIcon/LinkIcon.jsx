import React from "react";
import styled from "styled-components";

const StyledIcon = styled.div`
    position: relative;
    display: inline-block;
    width: 17px;
    height: 20px;
    font-size: ${(props) => props.theme.smallFont};
    font-family: ${(props) => props.theme.sans};
    line-height: 20px;
    margin: 0px 5px;
    
    ::before {
        content: '';
        display: block;
        position: absolute;
        width: 15px;
        height: 18px;
        border-top: ${(props) => (props.forward ? "2px solid" : "none")};
        border-right: ${(props) => (props.forward ? "2px solid" : "none")};
        border-left: ${(props) => (props.backward ? "2px solid" : "none")};
        border-bottom: ${(props) => (props.backward ? "2px solid" : "none")};
    }
    
    color: ${(props) => props.theme.standardTextColor};

    ::after {
       padding-left: ${(props) => (props.backward ? 6 : 3)}px;
       content: "${(props) =>
           props.referenceNum ? props.referenceNum : "•"}"; 
    }

    :hover {
        cursor: pointer;
        background-color: ${(props) => props.theme.hoveredBackgroundColor};
    }
`;

export const LinkIcon = ({ backward, forward, referenceNum }) => {
    return (
        <StyledIcon
            backward={backward}
            forward={forward}
            referenceNum={referenceNum}
        />
    );
};

export default LinkIcon;
