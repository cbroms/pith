import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    width: 100%;
    margin: 5px 0;
`;

const StyledAuthor = styled.div`
    margin-right: 10px;
    display: inline-block;
    font-family: ${(props) => props.theme.sans};
    font-weight: bold;
    font-size: ${(props) => props.theme.smallText};
    color: ${(props) => props.theme.textColor3};
`;

const StyledTime = styled.div`
    display: inline-block;
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.smallText};
    color: ${(props) => props.theme.textColor3};
`;

const PostLayout = (props) => {
    return (
        <StyledContainer>
            <StyledAuthor>{props.author}</StyledAuthor>
            <StyledTime>{props.time}</StyledTime>
            {props.children}
        </StyledContainer>
    );
};

export default PostLayout;
