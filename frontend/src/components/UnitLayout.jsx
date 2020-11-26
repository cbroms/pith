import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    position: relative;
    width: 100%;
`;

const StyledUnit = styled.div`
    box-sizing: border-box;
    display: ${(props) => (props.inline ? "inline-block" : "block")};
    width: ${(props) => (props.inline ? "auto" : "100%")};
    //position: absolute;
    padding: 5px 10px;
    padding-left: ${(props) => (props.inline ? 10 : 0)}px;
    width: 100%;

    color: ${(props) =>
        props.transcluded || props.lockedBy !== undefined
            ? props.theme.shade2
            : "inherit"};

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

const StyledLockedBy = styled.div`
    padding: 0 10px;
    font-size: ${(props) => props.theme.smallFont};
    font-family: ${(props) => props.theme.sans};
    color: ${(props) => props.theme.shade2};
`;

const UnitLayout = (props) => {
    return (
        <StyledContainer>
            <StyledUnit {...props}>
                {/* {props.transcludeNum ? (
                <StyledRefNum>{props.transcludeNum}</StyledRefNum>
            ) : null}*/}
                <StyledContent transcluded={props.transcluded}>
                    {props.content}
                </StyledContent>
            </StyledUnit>
            {props.lockedBy ? (
                <StyledLockedBy>
                    {props.lockedBy} is editing this unit
                </StyledLockedBy>
            ) : null}
        </StyledContainer>
    );
};

export default UnitLayout;
