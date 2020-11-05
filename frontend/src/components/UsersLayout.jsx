import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    box-sizing: border-box;
`;

const StyledUser = styled.div`
    font-family: ${(props) => props.theme.sans};
    box-sizing: border-box;
    display: inline-block;
   // padding: 2px;
    margin: 5px;
    text-align: center;
    width: 25px;
    height: 25px;
    border: 1px solid ${(props) =>
        props.active ? props.theme.shade3 : props.theme.shade2};
  //  background-color: ${(props) => props.theme.shade2};
    color: ${(props) =>
        props.active ? props.theme.shade3 : props.theme.shade2};
    font-weight: 600;
`;

const UsersLayout = (props) => {
    const users = props.users.map((user) => {
        return (
            <StyledUser
                key={user.userId}
                active={user.unitId === props.currentUnit}
            >
                {user.nickname[0].toUpperCase()}
            </StyledUser>
        );
    });
    return <StyledContainer>{users}</StyledContainer>;
};

export default UsersLayout;
