import React from "react";
import styled from "styled-components";

import { Button } from "./StandardUI";
import { UpArrow } from "./Symbols";

import TextEditor from "./TextEditor";

const StyledButton = styled(Button)`
    position: absolute;
    height: calc(100% - 2px);
    right: 1px;
    top: 1px;
    padding-top: 0;
    background-color: ${(props) => props.theme.shade1};

    :hover {
        background-color: ${(props) => props.theme.shade1};
        color: ${(props) => props.theme.shade3};
    }
`;

const StyledContainer = styled.div`
    position: relative;
    margin: 20px 0;
`;

const StyledEditor = styled(TextEditor)`
    box-sizing: border-box;
    display: inline-block;
   // border: ${(props) => props.theme.smallBorder};
   //background-color: IndianRed;
    min-height: 40px;
   // padding: 10px 0;
    padding-right: 50px;
    width: 100%;
    margin: 0;
    font-family: ${(props) => props.theme.serif};

    :empty::after {
        color: ${(props) => props.theme.shade2};
        content: "new message";
    }

    :focus {
        outline: none;
       // border: ${(props) => props.theme.smallBorderActive};
    }
`;

const TextEditorLayout = (props) => {
    return (
        <StyledContainer>
            <StyledEditor />
            <StyledButton>
                <UpArrow />
            </StyledButton>
        </StyledContainer>
    );
};

export default TextEditorLayout;
