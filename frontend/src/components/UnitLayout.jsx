import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    display: ${(props) => (props.inline ? "inline-block" : "block")};
    width: ${(props) => (props.inline ? "auto" : "100%")};
    padding: 5px 10px;
    width: 100%;
    padding-left: ${(props) => (props.transcluded || props.inline ? 10 : 0)}px;

    border-left: ${(props) =>
        props.transcluded ? "2px solid " + props.theme.shade2 : "none"};
    color: ${(props) =>
        props.transcluded
            ? !props.transcludeHoverActive
                ? props.theme.shade2
                : props.theme.shade1
            : "inherit"};

    background-color: ${(props) =>
        props.transcludeHoverActive ? props.theme.shade3 : "inherit"};

    mark {
        padding: 0 2px;
        background-color: ${(props) => props.theme.shade3};
        color: ${(props) => props.theme.shade1};
    }

    a {
        color: ${(props) => props.theme.shade3};
    }
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
    width: ${(props) => (props.transcluded ? "calc(100% - 18px)" : "100%")};
`;

const UnitLayout = (props) => {
    return (
        <StyledContainer {...props}>
            {/* {props.transcludeNum ? (
                <StyledRefNum>{props.transcludeNum}</StyledRefNum>
            ) : null}*/}
            <StyledContent transcluded={props.transcluded}>
                {props.content}
            </StyledContent>
        </StyledContainer>
    );
};

export default UnitLayout;
