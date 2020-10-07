import styled from "styled-components";

const UpArrow = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    color: ${(props) => props.theme.textColor2};

    ::after,
    ::before {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        top: 4px;
    }
    ::after {
        width: 8px;
        height: 8px;
        border-top: 2px solid;
        border-left: 2px solid;
        transform: rotate(45deg);
        left: 7px;
    }
    ::before {
        width: 2px;
        height: 16px;
        left: 10px;
        background: currentColor;
    }
`;

const DownChevron = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;

    ::after {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 10px;
        height: 10px;
        border-bottom: 2px solid ${(props) => props.theme.textColor2};
        border-right: 2px solid ${(props) => props.theme.textColor2};
        transform: rotate(45deg);
        left: 4px;
        top: 2px;
    }
`;

const RightChevron = styled(DownChevron)`
    ::after {
        transform: rotate(-45deg);
        left: 6px;
        top: 4px;
    }
`;

const UpChevron = styled(DownChevron)`
    ::after {
        transform: rotate(225deg);
        left: 5px;
        top: 10px;
    }
`;

const RightDoubleChevron = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;

    ::after,
    ::before {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 8px;
        height: 8px;
        border-right: 2px solid ${(props) => props.theme.textColor3};
        border-top: 2px solid ${(props) => props.theme.textColor3};
        transform: rotate(45deg);
        top: 7px;
        right: 6px;
    }
    ::after {
        right: 11px;
    }
`;

const VerticalLine = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 40px;

    ::after {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 10px;
        height: 40px;
        border-right: 1px solid ${(props) => props.theme.textColor2};
    }
`;

const Dot = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    color: ${(props) => props.theme.textColor2};

    ::after {
        content: "•";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 10px;
        height: 10px;
        left: 7px;
        top: 0;
    }
`;

export {
    UpArrow,
    DownChevron,
    RightChevron,
    UpChevron,
    RightDoubleChevron,
    VerticalLine,
    Dot,
};
