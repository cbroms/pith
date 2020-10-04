import React from "react";
import styled from "styled-components";

const UpArrow = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    color: ${(props) => props.theme.textColor2};

    ::after,
    ::before {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        top: 4px;
    }
    ::after {
        width: 8px;
        height: 8px;
        border-top: 2px solid;
        border-left: 2px solid;
        transform: rotate(45deg);
        left: 7px;
    }
    ::before {
        width: 2px;
        height: 16px;
        left: 10px;
        background: currentColor;
    }
`;

export { UpArrow };
