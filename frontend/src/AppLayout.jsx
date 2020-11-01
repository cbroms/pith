import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    background-color: ${(props) => props.theme.shade1};
    color: ${(props) => props.theme.shade3};
    height: 100vh;
    width: 100%;

    display: flex;
    flex-flow: column;
`;

const AppLayout = (props) => {
    return <StyledContainer>{props.children}</StyledContainer>;
};

export default AppLayout;
