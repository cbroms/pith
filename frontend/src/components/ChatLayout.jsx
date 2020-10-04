import React from "react";
import styled from "styled-components";

import TextEditorLayout from "./TextEditorLayout";

const StyledContainer = styled.div`
    box-sizing: border-box;
    background-color: ${(props) => props.theme.backgroundColor1};
    width: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    align-items: end;
    height: 100%;
    align-content: stretch;
    align-items: stretch;
`;

const StyledChatOverflow = styled.div`
    height: 100%;
    overflow-y: auto;
    // background-color: yellow;
`;

const StyledChat = styled.div`
    min-height: 100%;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    align-content: flex-end;
    // background-color: IndianRed;
`;

const StyledChatEditor = styled.div`
    position: relative;
    // background-color: Khaki;
    border-top: 3px solid ${(props) => props.theme.backgroundColor2};
`;

const ChatLayout = (props) => {
    return (
        <StyledContainer>
            <StyledChatOverflow>
                <StyledChat />
            </StyledChatOverflow>
            <StyledChatEditor>
                <TextEditorLayout />
            </StyledChatEditor>
        </StyledContainer>
    );
};

export default ChatLayout;
