import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	cursor: pointer;
	border: 1px solid
		${(props) =>
			props.copied ? props.theme.successShade : props.theme.shade2};
	padding: 10px;
	transition: border ${(props) => props.theme.animation};

	:hover {
		border: 1px solid
			${(props) =>
				props.copied ? props.theme.successShade : props.theme.shade3};
	}
`;

const StyledCopyPrompt = styled.div`
	padding: 0 2px;
	font-family: ${(props) => props.theme.sans};
	box-sizing: border-box;
	flex: 0 0 auto;

	color: ${(props) =>
		props.copied ? props.theme.successShade : props.theme.shade2};
`;

const StyledCopyContent = styled.div`
	font-family: monospace;
`;
const CopyContentLayout = (props) => {
	return (
		<StyledWrapper onClick={props.onCopy} copied={props.copied}>
			<StyledCopyContent>{props.data}</StyledCopyContent>
			<StyledCopyPrompt copied={props.copied}>
				{props.prompt}
			</StyledCopyPrompt>
		</StyledWrapper>
	);
};

export default CopyContentLayout;
