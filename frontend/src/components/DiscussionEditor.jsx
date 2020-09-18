import React from "react";

class DiscussionEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			values: { title: "", theme: "" },
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e, label) {
		const values = this.state.values;
		values[label] = e.target.value;
		this.setState({ values: values });
	}

	render() {
		return (
			<div>
				<input
					value={this.state.values.title}
					onChange={(e) => this.handleChange(e, "title")}
					placeholder="discussion title"
				/>

				<input
					value={this.state.values.theme}
					onChange={(e) => this.handleChange(e, "theme")}
					placeholder="discussion theme"
				/>

				<button
					onClick={() =>
						this.props.onSubmit(
							this.state.values.title,
							this.state.values.theme
						)
					}
				>
					Create new discussion
				</button>
			</div>
		);
	}
}

export default DiscussionEditor;
