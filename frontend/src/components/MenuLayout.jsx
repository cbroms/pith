import React from "react";
import styled from "styled-components";

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

const StyledContent = styled.div`
    height: 100%;
    grid-column-start: content;
    grid-column-end: content-end;
    grid-row-start: content;
    grid-row-end: content-end;

    // align-self: center;
    // white-space: nowrap;

    // display: flex;
    // align-items: center;
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
            <StyledContent>{props.content}</StyledContent>
            <StyledFooter>
                <StyledFooterItem>
                    Pith <em>&alpha;lpha</em>
                </StyledFooterItem>
                <StyledFooterItem>&bull;</StyledFooterItem>
                <StyledFooterItem>{props.darkToggle}</StyledFooterItem>
            </StyledFooter>
        </StyledContainer>
    );
};

export default MenuLayout;
