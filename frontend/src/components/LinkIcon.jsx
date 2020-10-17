import React from "react";
import styled from "styled-components";

const StyledIcon = styled.div`
    position: relative;
    display: inline-block;
    width: 17px;
    height: 18px;
    font-size: ${(props) => props.theme.smallFont};
    font-family: ${(props) => props.theme.sans};
    line-height: 20px;
    margin: 0px 2px;
    margin-top: 3px;
    
    ::before {
        content: '';
        display: block;
        position: absolute;
        width: 15px;
        height: 10px;
        border-top: ${(props) => (props.forward ? "2px solid" : "none")};
        border-right: ${(props) => (props.forward ? "2px solid" : "none")};
        border-left: ${(props) => (props.backward ? "2px solid" : "none")};
        border-bottom: ${(props) => (props.backward ? "2px solid" : "none")};
        right: 0;
    }
    
    color: ${(props) => props.theme.shade2};

    ::after {
       padding-left: ${(props) => (props.backward ? 6 : 3)}px;
       content: "${(props) =>
           props.referenceNum ? props.referenceNum : "•"}"; 
       color: ${(props) => props.theme.shade2};
    }

    :hover {
        cursor: pointer;
        background-color: ${(props) => props.theme.shade2};
    }
`;

export const LinkIcon = (props) => {
    return <StyledIcon {...props} />;
};

export default LinkIcon;
