import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    display: ${(props) => (props.inline ? "inline-block" : "block")};
    width: ${(props) => (props.inline ? "auto" : "100%")};
    margin: 5px ${(props) => (props.inline ? "10px" : "0")};
    font-size: ${(props) =>
        props.big ? props.theme.extraLargeFont : props.theme.mediumFont};
`;

const UnitLayout = (props) => {
    return (
        <StyledContainer
            big={props.big}
            inline={props.inline}
            dangerouslySetInnerHTML={{ __html: props.pith }}
        />
    );
};

export default UnitLayout;
