import React from "react";

import Block from "./Block";

import "./style/BlockSearch.css";

class BlockSearch extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: "",
			failed: false,
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentDidUpdate() {
		if (this.props.focus && this.inputRef) {
			this.inputRef.focus();
		}
	}

	handleChange(e) {
		this.setState({ value: e.target.value });
	}

	render() {
		const clickBlocks = this.props.searchResults.map((res) => {
			return (
				<Block
					content={res.body}
					tags={res.tags}
					id={res.id}
					dark={true}
					key={res.id}
					style={{ cursor: "pointer" }}
					transcluded={true}
					uneditable={true}
					onClick={(content) => this.props.onClick(content, res.id)}
				></Block>
			);
		});
		return (
			<div className="block-search-wrapper">
				<h2>Search discussion</h2>
				<input
					ref={(input) => {
						this.inputRef = input;
					}}
					placeholder="search"
					value={this.state.value}
					onChange={this.handleChange}
				/>
				<div className="block-search-buttons">
					<button
						onClick={() => this.props.blockSearch(this.state.value)}
					>
						Block search
					</button>
					<button
						onClick={() =>
							this.props.tagSearch(this.state.value.split(" "))
						}
					>
						Tag search
					</button>
				</div>
				<div className="block-search-annotation">
					{this.props.searchResults.length === 0 ? "No results" : ""}
				</div>
				<div className="block-search-suggestions">{clickBlocks}</div>
			</div>
		);
	}
}

export default BlockSearch;
