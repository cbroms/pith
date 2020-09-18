import React from "react";
import { connect } from "react-redux";

import NameEditor from "./NameEditor";
import Chat from "./Chat";
import Summary from "./Summary";
// import Library from "./Library";

import { getValue } from "../api/local";

import { registerUser, clearUser } from "../actions/userActions";
import {
	joinDiscussion,
	loadDiscussion,
	clearDiscussion,
	subscribeToDiscussion,
	addPostToDiscussion,
	addTagToBlock,
	removeTagFromBlock,
	saveBlock,
	unsaveBlock,
	blockSearch,
	tagSearch,
} from "../actions/discussionActions";

import "./style/Discussion.css";

function mapStateToProps(state, ownProps) {
	return {
		paramDiscussionID: ownProps.match.params.discussionID,
		userID: state.user.id,
		discussionID: state.discussion.id,
		loading: state.discussion.loadingDiscussion,
		loaded: state.discussion.loadedDiscussion,
		joined: state.discussion.joinedDiscussion,
		disussionTitle: state.discussion.title,
		discussionTheme: state.discussion.theme,
		subscribed: state.discussion.subscribed,
		badPseudonym: state.errors.discussion.badPseudonym,
		numLoaded: state.discussion.numLoaded,
		totalToLoad: state.discussion.totalToLoad,
		blocks: state.discussion.blocks,
		savedBlocks: state.discussion.savedBlocks,
		posts: state.discussion.posts,
		searchResults: state.discussion.searchResults,
	};
}

class Discussion extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			autojoin: true,
		};

		this.joinDiscussionWithName = this.joinDiscussionWithName.bind(this);
		this.addPost = this.addPost.bind(this);

		this.addTag = this.addTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
		this.saveBlock = this.saveBlock.bind(this);
		this.unsaveBlock = this.unsaveBlock.bind(this);

		this.blockSearch = this.blockSearch.bind(this);
		this.tagSearch = this.tagSearch.bind(this);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(registerUser());
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		if (this.props.userID && !this.props.joined) {
			// check if the discussion has been marked as joined in localstorage
			let discussions = getValue("joinedDiscussions");
			if (
				discussions !== null &&
				discussions.includes(this.props.paramDiscussionID)
			) {
				// if it's already been joined, join it again without a name so
				// we don't have to re-enter a pseudonym
				this.joinDiscussionWithName(null);
			} else if (this.state.autojoin) {
				this.setState({ autojoin: false });
			}
		} else if (
			this.props.joined &&
			!this.props.loading &&
			!this.props.loaded
		) {
			// when we've joined, start loading the discussion
			dispatch(
				loadDiscussion(this.props.discussionID, this.props.userID)
			);
		} else if (
			this.props.joined &&
			this.props.loaded &&
			!this.props.subscribed
		) {
			// once everything is loaded, we can subscribe to new events
			dispatch(subscribeToDiscussion(this.props.discussionID));
		}
	}

	componentWillUnmount() {
		const { dispatch } = this.props;
		dispatch(clearUser());
		dispatch(clearDiscussion());
	}

	joinDiscussionWithName(pseudonym) {
		const { dispatch } = this.props;
		dispatch(
			joinDiscussion(
				this.props.paramDiscussionID,
				this.props.userID,
				pseudonym
			)
		);
	}

	addPost(blocks) {
		const { dispatch } = this.props;
		dispatch(
			addPostToDiscussion(
				this.props.discussionID,
				this.props.userID,
				blocks
			)
		);
	}

	addTag(blockID, tag) {
		const { dispatch } = this.props;
		dispatch(
			addTagToBlock(
				this.props.discussionID,
				this.props.userID,
				blockID,
				tag
			)
		);
	}

	removeTag(blockID, tag) {
		const { dispatch } = this.props;
		dispatch(
			removeTagFromBlock(
				this.props.discussionID,
				this.props.userID,
				blockID,
				tag
			)
		);
	}

	saveBlock(blockID) {
		const { dispatch } = this.props;
		dispatch(
			saveBlock(this.props.discussionID, this.props.userID, blockID)
		);
	}

	unsaveBlock(blockID) {
		const { dispatch } = this.props;
		dispatch(
			unsaveBlock(this.props.discussionID, this.props.userID, blockID)
		);
	}

	blockSearch(query) {
		const { dispatch } = this.props;
		dispatch(blockSearch(this.props.discussionID, query));
	}

	tagSearch(query) {
		const { dispatch } = this.props;
		dispatch(tagSearch(this.props.discussionID, query));
	}

	render() {
		if (this.props.userID && !this.props.joined && !this.state.autojoin) {
			return (
				<NameEditor
					badPseudonym={this.props.badPseudonym}
					onSubmit={this.joinDiscussionWithName}
				/>
			);
		} else if (this.props.joined && this.props.loading) {
			return (
				<div className="discussion-loading">
					Loading discussion
					{this.props.totalToLoad > 0
						? ` (${this.props.numLoaded}/${this.props.totalToLoad})`
						: "..."}
				</div>
			);
		} else if (this.props.loaded) {
			return (
				<div className="discussion-wrapper">
					<Summary />
					<Chat
						blocks={this.props.blocks}
						savedBlocks={this.props.savedBlocks}
						posts={[...this.props.posts]}
						addPost={this.addPost}
						addTag={this.addTag}
						removeTag={this.removeTag}
						saveBlock={this.saveBlock}
						unsaveBlock={this.unsaveBlock}
						userID={this.props.userID}
						tagSearch={this.tagSearch}
						blockSearch={this.blockSearch}
						searchResults={this.props.searchResults}
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}

export default connect(mapStateToProps)(Discussion);

// <div className="discussion-title-wrapper">
// 						<h1>{this.props.disussionTitle}</h1>
// 						<div className="discussion-theme">
// 							{this.props.discussionTheme}
// 						</div>
// 					</div>
