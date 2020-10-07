import styled from "styled-components";

const LargeHeading = styled.h2`
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.largeFont};
    font-weight: 400;
    margin: 0;
    display: inline-block;
`;

const Button = styled.button`
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.mediumFont};
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    padding: ${(props) => (props.noBackground ? "0" : "10px")};
    margin: ${(props) => (props.noBackground ? "5px 0" : "0")};

    vertical-align: middle;
    background-color: ${(props) =>
        props.noBackground ? "inherit" : props.theme.backgroundColor2};

    :hover {
        background-color: ${(props) =>
            props.noBackground ? "inherit" : props.theme.backgroundColor3};
    }
`;

export { LargeHeading, Button };
