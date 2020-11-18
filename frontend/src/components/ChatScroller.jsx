import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
	position: relative;
`;
const StyledChatOverflow = styled.div`
	height: 100%;
	overflow-y: auto;
	position: relative;
`;

const StyledMissedMessages = styled.div`
	background-color: ${(props) => props.theme.shade3};
	color: ${(props) => props.theme.shade1};
	padding: 5px;
	bottom: 0;
	right: 10px;
	position: absolute;

	cursor: pointer;
`;

const StyledChat = styled.div`
	position: absolute;
	min-height: 100%;
	display: flex;
	align-items: flex-end;
	flex-wrap: wrap;
	align-content: flex-end;
`;

class ChatScroller extends React.Component {
	constructor(props) {
		super(props);
		this.state = { numMissed: 0 };
		this.listRef = React.createRef();

		this.handleScroll = this.handleScroll.bind(this);
		this.scrollToBottom = this.scrollToBottom.bind(this);
	}

	componentDidMount() {
		this.scrollToBottom();
	}

	scrollToBottom() {
		this.listRef.current.scrollTop = this.listRef.current.scrollHeight;
	}

	getSnapshotBeforeUpdate(prevProps, prevState) {
		// if we add a new item to the list, check where the scoll positon is
		if (prevProps.numPosts < this.props.numPosts) {
			const scrollElt = this.listRef.current;
			if (
				Math.abs(
					scrollElt.scrollHeight -
						scrollElt.scrollTop -
						scrollElt.clientHeight
				) <= 5
			) {
				return scrollElt.scrollHeight - scrollElt.scrollTop;
			}
			return -1; // we're somewhere up from the bottom
		}
		return null;
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (snapshot !== null && snapshot !== -1) {
			// we're at the bottom of the scrollbar, so adjust the height to account for the new post
			const scrollElt = this.listRef.current;
			scrollElt.scrollTop = scrollElt.scrollHeight - snapshot;
		} else if (snapshot === -1) {
			this.setState({ numMissed: this.state.numMissed + 1 });
		}
	}

	handleScroll() {
		// if we're at the bottom and there are messages we haven't seen, reset them
		const scrollElt = this.listRef.current;

		if (
			this.state.numMissed > 0 &&
			Math.abs(
				scrollElt.scrollHeight -
					scrollElt.scrollTop -
					scrollElt.clientHeight
			) <= 5
		) {
			this.setState({ numMissed: 0 });
		}
	}

	render() {
		return (
			<StyledContainer>
				<StyledChatOverflow
					ref={this.listRef}
					onScroll={this.handleScroll}
				>
					<StyledChat>{this.props.children}</StyledChat>
				</StyledChatOverflow>
				{this.state.numMissed > 0 ? (
					<StyledMissedMessages onClick={this.scrollToBottom}>
						{this.state.numMissed} new post
						{this.state.numMissed > 1 ? "s" : ""}
					</StyledMissedMessages>
				) : null}
			</StyledContainer>
		);
	}
}

export default ChatScroller;
