import React from "react";

import "./style/NameEditor.css";

class NameEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: "" };

		this.handleChange = this.handleChange.bind(this);
		this.handleKeypress = this.handleKeypress.bind(this);
	}

	handleChange(e) {
		this.setState({ value: e.target.value });
	}

	handleKeypress(e) {
		if (e.keyCode === 13) {
			this.props.onSubmit(this.state.value);
		}
	}

	render() {
		const error = this.props.badPseudonym ? (
			<div>Whoops! You can't use that nickname.</div>
		) : null;
		return (
			<div className="name-editor-wrapper">
				<h1>Join Discussion</h1>
				<div>
					Before joining the discussion, choose a nickname. It'll be
					how your posts are identified in the chat.
				</div>
				<input
					placeholder="your nickname"
					value={this.state.content}
					onChange={this.handleChange}
					onKeyDown={this.handleKeypress}
				/>
				<button onClick={() => this.props.onSubmit(this.state.value)}>
					Join Discussion
				</button>
				{error}
			</div>
		);
	}
}

export default NameEditor;
