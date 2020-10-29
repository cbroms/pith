import styled from "styled-components";

const LargeHeading = styled.h2`
    font-family: ${(props) => props.theme.serif};
    font-size: ${(props) => props.theme.extraLargeFont};
    font-weight: 600;

    display: inline-block;
`;

const MediumHeading = styled.h2`
    font-family: ${(props) => props.theme.sans};
    font-size: ${(props) => props.theme.largeFont};
    font-weight: 600;

    display: inline-block;
`;

const Paragraph = styled.p`
    font-family: ${(props) => props.theme.serif};
    font-weight: 400;
`;

const Input = styled.input`
    font-family: ${(props) => props.theme.serif};
    font-size: ${(props) => props.theme.mediumFont};
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    padding: 10px;
  //  margin: ${(props) => (props.noBackground ? "5px 0" : "0")};
   
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
    color: ${(props) => props.theme.shade2};
    vertical-align: middle;
    background-color: ${(props) =>
        props.noBackground ? "inherit" : props.theme.shade2};

    :hover {
        background-color: ${(props) =>
            props.noBackground ? "inherit" : props.theme.shade2};
    }
`;

export { LargeHeading, Paragraph, Button, MediumHeading, Input };
