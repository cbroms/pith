import React, { useState } from "react";
import styled from "styled-components";

import { MediumHeading, Paragraph, Button } from "./StandardUI";
import { CloseIcon } from "./Symbols";

const StyledContainer = styled.div`
	transition: max-height ${(props) => props.theme.animation};

	box-sizing: border-box;
	position: relative;
	width: 100%;
	max-height: ${(props) => (props.open ? "100%" : "0px")};
	max-width: 100%;
	background-color: ${(props) => props.theme.errorShade};
	color: black;
	z-index: 1;
`;

const StyledContent = styled.div`
	box-sizing: border-box;
	font-family: ${(props) => props.theme.sans};
	width: 100%;
	max-width: 2000px;
	margin: 0 auto;
	padding: 20px 10px;
	position: relative;

	z-index: -1;
`;

const StyledHeader = styled(MediumHeading)`
	display: inline-block;
	font-family: monospace;
	margin: 0;
	margin-right: 20px;
`;

const StyledParagraph = styled(Paragraph)`
	display: inline-block;
	margin: 0;
`;

const StyledButton = styled(Button)`
	float: right;
	background-color: inherit;
	color: inherit;
	display: ${(props) => (props.open ? "block" : "none")};
	padding: 0;

	:hover {
		background-color: inherit;
	}
`;

const SystemErrorLayout = (props) => {
	return (
		<StyledContainer open={props.open}>
			<StyledContent>
				<StyledHeader>500 - Server Error</StyledHeader>
				<StyledParagraph>
					Something went wrong. Please try again later.
				</StyledParagraph>
				<StyledButton open={props.open} onClick={props.onClose}>
					<CloseIcon />
				</StyledButton>
			</StyledContent>
		</StyledContainer>
	);
};

export default SystemErrorLayout;
