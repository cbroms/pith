import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    background-color: ${(props) => props.theme.backgroundColor1};
    width: 100%;
    margin: 5px 0;
`;

const UnitLayout = (props) => {
    return <StyledContainer dangerouslySetInnerHTML={{ __html: props.pith }} />;
};

export default UnitLayout;
