import React from "react";
import styled from "styled-components";

const LargeHeading = styled.h2`
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.largeFont};
    font-weight: 400;
    margin: 0;
`;

const Button = styled.button`
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.mediumFont};
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    padding: 10px;
    margin: 0;
    background-color: ${(props) => props.theme.backgroundColor2};

    :hover {
        background-color: ${(props) => props.theme.backgroundColor3};
    }
`;

export { LargeHeading, Button };
