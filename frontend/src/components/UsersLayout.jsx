import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
    margin: 25px 0;
`;

const StyledUser = styled.div`
    box-sizing: border-box;
    display: inline-block;
    margin: 0 5px;
    text-align: center;
    width: 25px;
    height: 25px;
    border: 1px solid ${(props) => props.theme.textColor2};
    background-color: ${(props) => props.theme.backgroundColor2};
    // display: ${(props) => (props.inline ? "inline-block" : "block")};
    // width: ${(props) => (props.inline ? "auto" : "100%")};
    // margin: 5px ${(props) => (props.inline ? "10px" : "0")};
   
`;

const UsersLayout = (props) => {
    const users = props.users.map((user) => {
        return (
            <StyledUser key={user.user_id}>
                {user.nickname[0].toUpperCase()}
            </StyledUser>
        );
    });
    return <StyledContainer>{users}</StyledContainer>;
};

export default UsersLayout;
