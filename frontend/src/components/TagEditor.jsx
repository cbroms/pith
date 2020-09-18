import React from "react";

import "./style/TagEditor.css";

class TagEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: this.props.visible,
			tempAdd: null,
			tempRemove: null,
			value: "",
			editing: false,
		};

		this.handleKeypress = this.handleKeypress.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.checkFocus = this.checkFocus.bind(this);
	}

	checkFocus() {
		if (this.inputRef) {
			this.inputRef.focus();
		}
	}

	componentDidUpdate() {
		if (this.props.visible && !this.state.visible) {
			this.setState({ visible: true, editing: true }, () => {
				this.checkFocus();
			});
		}

		// if the new list of tags includes the temporary add tag, remove it
		if (
			this.state.tempAdd &&
			this.props.tags.filter((o) => o.tag === this.state.tempAdd).length >
				0
		) {
			this.setState({ tempAdd: null });
		}

		// if the new list of tags does not include the temporary remove tag, remove it
		if (
			this.state.tempRemove &&
			this.props.tags.filter((o) => o.tag !== this.state.tempRemove)
				.length <= 0
		) {
			this.setState({ tempRemove: null });
		}
	}

	handleKeypress(e) {
		if (e.keyCode === 13) {
			if (
				this.props.tags.filter((o) => o.tag === this.state.value)
					.length <= 0
			) {
				this.props.addTag(this.state.value);
				this.setState({
					editing: false,
					value: "",
					tempAdd: this.state.value,
					visible: true,
				});
				e.preventDefault();
			} else {
				this.setState({ editing: false, value: "" });
			}
		} else if (e.keyCode === 8) {
			if (this.state.value.length === 0) {
				this.setState({ editing: false, visible: false });
				this.props.onClose();
			}
		}
	}

	handleChange(e) {
		this.setState({ value: e.target.value });
	}

	render() {
		let editor;
		if (this.state.editing) {
			editor = (
				<input
					ref={(input) => {
						this.inputRef = input;
					}}
					className="tag-input"
					type="text"
					placeholder="New tag"
					onKeyDown={this.handleKeypress}
					value={this.state.value}
					onChange={this.handleChange}
				/>
			);
		} else if (this.props.tags && this.props.tags.length > 0) {
			editor = (
				<div
					className="tag-button"
					onClick={() => {
						this.setState({ editing: true }, () =>
							this.checkFocus()
						);
					}}
				>
					+
				</div>
			);
		}
		const tags = [];
		for (const tag in this.props.tags) {
			if (tag !== this.state.tempRemove) {
				const newElt = (
					<div className="tag" key={this.props.blockID + tag}>
						{this.props.tags[tag].tag}
						{this.props.tags[tag].owner === this.props.userID ? (
							<div
								className="tag-close"
								onClick={() => {
									this.props.removeTag(tag);
									this.setState({ tempRemove: tag });
								}}
							>
								×
							</div>
						) : (
							<div />
						)}
					</div>
				);
				tags.push(newElt);
			}
		}

		// add the temporary tag to the list of tags while it's loading
		if (this.state.tempAdd) {
			tags.push(
				<div
					className="tag"
					key={this.props.blockID + this.state.tempAdd + "temp"}
				>
					{this.state.tempAdd}
				</div>
			);
		}

		if (!this.props.visible && tags.length === 0) {
			return null;
		}

		return (
			<div className="tag-wrapper">
				<div className="tags">
					{tags}
					{editor}
				</div>
			</div>
		);
	}
}

export default TagEditor;
