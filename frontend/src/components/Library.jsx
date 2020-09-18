import React from "react";

import Block from "./Block";

import {
	listenForSavedBlock,
	listenForUnsavedBlock,
	getSavedBlocks,
} from "../api/block";

import "./style/Library.css";

class Library extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id: this.props.id,
			blocks: [],
		};
	}

	componentDidMount() {
		getSavedBlocks({ discussionId: this.state.id }, (data) => {
			this.setState({ blocks: data });
		});

		listenForSavedBlock((data) => {
			const blocks = this.state.blocks;
			if (!this.state.blocks.includes(data.block_id)) {
				blocks.push(data.block_id);
				this.setState({ blocks: blocks });
			}
		});

		listenForUnsavedBlock((data) => {
			if (this.state.blocks.includes(data.block_id)) {
				const blocks = this.state.blocks;
				blocks.splice(blocks.indexOf(data.block_id), 1);
				this.setState({ blocks: blocks });
			}
		});
	}

	render() {
		const blocks = this.state.blocks.map((block) => {
			return (
				<Block
					savedBlocks={this.state.blocks}
					transcluded
					key={`saved-${block}`}
					discussionId={this.state.id}
					id={block}
					onReply={(data) => this.props.createReply(block, data)}
					save={false}
				/>
			);
		});
		return (
			<div className="library-wrapper">
				{blocks.length > 0 ? blocks : "Nothing saved yet"}
			</div>
		);
	}
}

export default Library;
