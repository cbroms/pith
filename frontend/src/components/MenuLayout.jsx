import React from "react";
import styled from "styled-components";

import { Dot } from "./Symbols";

const StyledContainer = styled.div`
    box-sizing: border-box;
    background-color: ${(props) => props.theme.shade1};
    width: 100%;
    overflow: hidden;

    height: 100%;
    padding: 20px;

    display: grid;
    grid-template-columns: [content] 1fr [content-end];
    grid-template-rows: [content] 1fr [content-end footer] 40px [footer-end];
`;

const StyledFooterItem = styled.span`
    display: inline-block;
    margin-right: 15px;
`;

const StyledFooter = styled.div`
    height: 100%;
    grid-column-start: content;
    grid-column-end: content-end;
    grid-row-start: footer;
    grid-row-end: footer-end;
    align-self: center;
    white-space: nowrap;

    display: flex;
    align-items: center;
`;

const MenuLayout = (props) => {
    return (
        <StyledContainer>
            <StyledFooter>
                <StyledFooterItem>Pith version 0.1</StyledFooterItem>
                <StyledFooterItem>&bull;</StyledFooterItem>
                <StyledFooterItem>{props.darkToggle}</StyledFooterItem>
            </StyledFooter>
        </StyledContainer>
    );
};

export default MenuLayout;
