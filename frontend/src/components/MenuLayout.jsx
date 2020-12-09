import React from "react";
import styled from "styled-components";

import { LargeHeading, Paragraph } from "./StandardUI";

const StyledContainer = styled.div`
    padding-left: 40px;
    box-sizing: border-box;
    background-color: ${(props) => props.theme.shade1};
    width: 100%;
    overflow: hidden;

    height: 100%;

    display: grid;
    grid-template-columns: [content] 1fr [content-end];
    grid-template-rows: [content] 1fr [content-end footer] 200px [footer-end];
`;

const StyledFooterItem = styled.span`
    display: inline-block;
    margin-right: 15px;

    a:visited {
        color: ${(props) => props.theme.shade2};
    }
`;

const StyledContent = styled.div`
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    padding-left: 0;
    grid-column-start: content;
    grid-column-end: content-end;
    grid-row-start: content;
    grid-row-end: content-end;

    a {
        margin: 25px 0;
        font-size: ${(props) => props.theme.largeFont};
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
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    padding-left: 0;
    grid-column-start: content;
    grid-column-end: content-end;
    grid-row-start: footer;
    grid-row-end: footer-end;

    border-top: 1px solid ${(props) => props.theme.shade2};
`;

const StyledFooterContent = styled.div`
    margin-top: 40px;
    align-self: center;
    white-space: nowrap;

    display: flex;
    align-items: center;
`;

const StyledTitle = styled(LargeHeading)`
    font-size: 4rem;
    margin-top: 30px;
    margin-right: 5px;
    display: inline-block;
    margin-bottom: 0;
`;

const StyledSuperscript = styled(Paragraph)`
    display: inline-block;
    vertical-align: top;
    margin-top: 30px;
    font-size: 1.75rem;
    font-weight: 300;
    font-style: italic;
`;

const MenuLayout = (props) => {
    return (
        <StyledContainer>
            <StyledContent>
                <StyledTitle>Pith</StyledTitle>
                <StyledSuperscript>&alpha;</StyledSuperscript>

                {props.content}
            </StyledContent>
            <StyledFooter>
                <StyledItemTitle>
                    Anyone with the link can join this discussion
                </StyledItemTitle>
                {props.copyUrl}
                <StyledFooterContent>
                    <StyledFooterItem>
                        <a href="https://pith.is">Pith</a>
                    </StyledFooterItem>
                    <StyledFooterItem>&bull;</StyledFooterItem>
                    <StyledFooterItem>
                        <a href="https://why.pith.is">Pith blog</a>
                    </StyledFooterItem>
                    <StyledFooterItem>&bull;</StyledFooterItem>
                    <StyledFooterItem>
                        <a href="https://github.com/rainflame/pith">
                            Pith is open source
                        </a>
                    </StyledFooterItem>
                    <StyledFooterItem>&bull;</StyledFooterItem>
                    <StyledFooterItem>{props.darkToggle}</StyledFooterItem>
                </StyledFooterContent>
            </StyledFooter>
        </StyledContainer>
    );
};

export default MenuLayout;
