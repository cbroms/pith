import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    background-color: grey;
    width: 100%;
    //padding: 0 10px;
    display: grid;
    grid-template-rows: 1fr 80px;
    align-items: end;
    height: 100%;
    align-content: stretch;
    align-items: stretch;
`;

const StyledChatOverflow = styled.div`
    height: 100%;
    overflow-y: auto;
    background-color: yellow;
`;

const StyledChat = styled.div`
    min-height: 100%;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    align-content: flex-end;
    background-color: red;
`;

const StyledChatEditor = styled.div`
    position: relative;
    background-color: orange;
    border-top: 3px solid #313131;
`;

const ChatLayout = (props) => {
    return (
        <StyledContainer>
            <StyledChatOverflow>
                <StyledChat>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                    <p>This is some align-content</p>
                </StyledChat>
            </StyledChatOverflow>
            <StyledChatEditor />
        </StyledContainer>
    );
};

export default ChatLayout;

// .chat-container {
//     max-width: var(--column-width);
//     width: 100%;
//     margin: 0 10px;
//     display: grid;
//     grid-template-rows: auto 1fr auto;
//     height: 100vh;
//     max-height: 1400px;
// }

// .chat-header {
//     border-bottom: 3px solid #313131;
// }

// .chat-footer {
//     position: relative;
//     border-top: 3px solid #313131;
// }

// .chat-overflow-wrapper {
//     height: 100%;
//     overflow-y: auto;
// }

// .chat-wrapper {
//     height: calc(85vh - (var(--column-padding) * 2));
//     max-height: 1200px;
//     width: 100%;
//     position: relative;
// }

// .chat {
//     min-height: 100%;
//     display: flex;
//     align-items: flex-end;
//     flex-wrap: wrap;
//     align-content: flex-end;
//     margin-bottom: 25px;
// }

// .chat-zoom {
//     cursor: pointer;
//     padding: 10px;
//     position: absolute;
//     right: 0;
//     top: 15px;
//     background-color: #101010;
//     z-index: 1000;
// }
