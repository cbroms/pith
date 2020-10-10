import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    display: ${(props) => (props.inline ? "inline-block" : "block")};
    width: ${(props) => (props.inline ? "auto" : "100%")};
    padding: 5px 0;
    margin: 0 ${(props) => (props.inline ? "10px" : "0")};
    font-size: ${(props) =>
        props.big ? props.theme.extraLargeFont : props.theme.mediumFont};

    padding-left: ${(props) => (props.transcluded ? 10 : 0)}px;
    border-left: ${(props) =>
        props.transcluded ? "2px solid " + props.theme.textColor3 : "none"};
    color: ${(props) =>
        props.transcluded ? props.theme.textColor2 : "inherit"};
`;

const StyledRefNum = styled.span`
    vertical-align: top;
    margin-right: 10px;
    font-size: ${(props) => props.theme.smallFont};
    font-family: ${(props) => props.theme.sans};
    font-style: normal;
`;

const StyledContent = styled.div`
    display: inline-block;
    width: calc(100% - 18px);
`;

const UnitLayout = (props) => {
    return (
        <StyledContainer
            big={props.big}
            inline={props.inline}
            transcluded={props.transcluded}
        >
            {props.transcludeNum ? (
                <StyledRefNum>{props.transcludeNum}</StyledRefNum>
            ) : null}
            <StyledContent>{props.content}</StyledContent>
        </StyledContainer>
    );
};

export default UnitLayout;
