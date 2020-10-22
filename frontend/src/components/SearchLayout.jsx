import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    background-color: ${(props) => props.theme.shade1};
    width: 100%;
    height: 100%;

    overflow: hidden;
    padding: 20px;
`;

const SearchLayout = (props) => {
    return <StyledContainer>{props.children}</StyledContainer>;
};

export default SearchLayout;
