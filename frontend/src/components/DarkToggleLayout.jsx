import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    height: 100%;
    display: inline-block;
`;

const StyledToggleBox = styled.div`
    box-sizing: border-box;
    display: inline-block;
    cursor: pointer;
    width: 20px;
    height: 20px;
    margin-right: ${(props) => (props.dark ? 5 : 0)}px;
    background-color: ${(props) =>
        props.theme.type === "dark"
            ? props.dark
                ? props.theme.shade1
                : props.theme.shade3
            : props.dark
            ? props.theme.shade3
            : props.theme.shade1};
    border: 1px solid
        ${(props) =>
            props.theme.type === "dark"
                ? props.dark
                    ? props.theme.shade3
                    : props.theme.shade1
                : props.dark
                ? props.theme.shade1
                : props.theme.shade3};
`;

const DarkToggleLayout = (props) => {
    return (
        <StyledContainer>
            <StyledToggleBox dark onClick={() => props.setDarkMode(true)} />
            <StyledToggleBox onClick={() => props.setDarkMode(false)} />{" "}
        </StyledContainer>
    );
};

export default DarkToggleLayout;
