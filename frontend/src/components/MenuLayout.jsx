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
    grid-template-rows: [content] 1fr [content-end footer] 150px [footer-end];
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

    a {
        margin: 25px 0;
        font-size: ${(props) => props.theme.extraLargeFont};
        display: block;
    }

    a:visited {
        color: ${(props) => props.theme.shade2};
    }
`;

const StyledItemTitle = styled.div`
    font-size: ${(props) => props.theme.mediumFont};
    font-family: ${(props) => props.theme.sans};
    color: ${(props) => props.theme.shade2};
    margin-bottom: 10px;
`;
const StyledFooter = styled.div`
    height: 100%;
    grid-column-start: content;
    grid-column-end: content-end;
    grid-row-start: footer;
    grid-row-end: footer-end;
`;

const StyledFooterContent = styled.div`
    margin-top: 40px;
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
                <StyledItemTitle>
                    Anyone with the link can join this discussion
                </StyledItemTitle>
                {props.copyUrl}
                <StyledFooterContent>
                    <StyledFooterItem>
                        Pith <em>&alpha;lpha</em>
                    </StyledFooterItem>
                    <StyledFooterItem>&bull;</StyledFooterItem>
                    <StyledFooterItem>{props.darkToggle}</StyledFooterItem>
                </StyledFooterContent>
            </StyledFooter>
        </StyledContainer>
    );
};

export default MenuLayout;
