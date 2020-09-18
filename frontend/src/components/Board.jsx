import React from "react";
import { Link } from "react-router-dom";

import DiscussionEditor from "./DiscussionEditor";

import {
	getDiscussions,
	listenForNewDiscussion,
	createDiscussion,
} from "../api/discussion";

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			discussions: [],
		};

		this.createDiscussion = this.createDiscussion.bind(this);
	}

	componentDidMount() {
		const {
			match: { params },
		} = this.props;
		this.setState({ id: params.boardID });

		getDiscussions((data) => {
			this.setState({ discussions: data });
		});

		listenForNewDiscussion((data) => {
			const discussions = this.state.discussions;
			discussions.push(data);
			this.setState({ discussions: discussions });
		});
	}

	createDiscussion(title, theme) {
		createDiscussion(
			{ title: title, theme: theme, expiration: 1000 },
			(data) => {
				console.log(data);
				console.log("new discussion created!");
			}
		);
	}

	render() {
		const discussions = this.state.discussions.map((discussion) => {
			return (
				<Link to={`${this.state.id}/d/${discussion}`} key={discussion}>
					<div>{`Discussion ${discussion}`}</div>
				</Link>
			);
		});
		return (
			<div>
				<h1>Discussions</h1>
				{discussions}
				<h3>Create Discussion</h3>
				<DiscussionEditor onSubmit={this.createDiscussion} />
			</div>
		);
	}
}

export default Board;
