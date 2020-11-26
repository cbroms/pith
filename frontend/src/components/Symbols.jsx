import styled from "styled-components";

const UpArrow = styled.div`
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 15px;
    color: inherit;

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
        height: 14px;
        left: 10px;
        background: currentColor;
    }
`;

const RightArrow = styled(UpArrow)`
    transform: rotate(90deg);
`;

const SmallRightArrow = styled(UpArrow)`
    transform: rotate(90deg) scale(0.6);
`;

const DownArrow = styled(UpArrow)`
    transform: rotate(180deg);
`;

const SmallDownArrow = styled(UpArrow)`
    top: 5px;
    transform: rotate(180deg) scale(0.6);
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
        width: 8px;
        height: 8px;
        border-bottom: 2px solid;
        border-right: 2px solid;
        transform: rotate(45deg);
        left: 4px;
        top: 4px;
    }
`;

const RightChevron = styled(DownChevron)`
    ::after {
        transform: rotate(-45deg);
        left: 6px;
        top: 5px;
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
        border-right: 2px solid ${(props) => props.theme.shade2};
        border-top: 2px solid ${(props) => props.theme.shade2};
        transform: rotate(45deg);
        top: 7px;
        right: 6px;
    }
    ::after {
        right: 11px;
    }
`;

const MoveRightChevron = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid transparent;

    ::after,
    ::before {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 2px;
        height: 14px;
        border-right: 2px solid ${(props) => props.theme.shade2};
        top: 2px;
        right: 0;
    }
    ::after {
        width: 8px;
        height: 8px;
        border-bottom: 2px solid ${(props) => props.theme.shade2};
        transform: rotate(-45deg);
        right: 6px;
        top: 5px;
    }
`;

const MoveDownChevron = styled(MoveRightChevron)`
    transform: rotate(90deg);
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
        border-right: 1px solid;
    }
`;

const Dot = styled.div`
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 11px;
    margin: 6px 4px;
    height: 11px;
    border: 2px solid ${(props) => props.theme.shade2};
   // background-color: ${(props) => props.theme.shade2};
    border-radius: 50%;

    :hover {
         border: 1px solid ${(props) => props.theme.shade3};
    }
`;

const DiscussionIcon = styled.div`
    box-sizing: border-box;
    position: relative;
    margin: 5px 10px;
    display: inline-block;
    width: 20px;
    height: 2px;
    transform: scale(0.75);
    background-color: ${(props) => props.theme.shade2};

    ::after,
    ::before {
        box-sizing: border-box;
        position: relative;
        display: block;
        width: 20px;
        height: 2px;
        background-color: ${(props) => props.theme.shade2};
    }
    ::after,
    ::before {
        content: "";
        position: absolute;
        top: -6px;
        width: 10px;
    }
    ::after {
        top: 6px;
        width: 14px;
    }
`;

const DocumentIcon = styled.div`
    box-sizing: border-box;
    position: relative;
    margin: 5px 10px;
    display: inline-block;
    transform: scale(0.75);
    width: 14px;
    right: 0;
    height: 2px;
    background-color: ${(props) => props.theme.shade2};

    ::after,
    ::before {
        box-sizing: border-box;
        position: relative;
        display: block;
        width: 20px;
        height: 2px;
        right: 0;
        background-color: ${(props) => props.theme.shade2};
    }
    ::after,
    ::before {
        content: "";
        position: absolute;
        top: -6px;
        width: 20px;
    }
    ::after {
        top: 6px;
        width: 8px;
        right: 0;
    }
`;

const MenuIcon = styled.div`
    box-sizing: border-box;
    position: relative;
    margin: 5px 10px;
    display: inline-block;
    width: 16px;
    height: 2px;
    background-color: ${(props) => props.theme.shade2};

    ::after,
    ::before {
        box-sizing: border-box;
        position: relative;
        display: block;
        width: 16px;
        height: 2px;
        background-color: ${(props) => props.theme.shade2};
    }
    ::after,
    ::before {
        content: "";
        position: absolute;
        top: -6px;
    }
    ::after {
        top: 6px;
    }
`;

const CloseIcon = styled.div`
    box-sizing: border-box;
    margin: 0 10px;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid transparent;

    ::after,
    ::before {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        width: 16px;
        height: 2px;
        background: currentColor;
        transform: rotate(45deg);
        border-radius: 5px;
        top: 8px;
        left: 1px;
    }
    ::after {
        transform: rotate(-45deg);
    }
`;

export {
    UpArrow,
    RightArrow,
    SmallRightArrow,
    DownArrow,
    SmallDownArrow,
    DownChevron,
    RightChevron,
    UpChevron,
    RightDoubleChevron,
    MoveRightChevron,
    MoveDownChevron,
    VerticalLine,
    Dot,
    DiscussionIcon,
    DocumentIcon,
    MenuIcon,
    CloseIcon,
};
