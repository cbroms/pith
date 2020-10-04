import React from "react";
import ContentEditable from "react-contenteditable";
import sanitizeHtml from "sanitize-html";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: this.props.content || "",
      editable: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sanitize = this.sanitize.bind(this);
    this.toggleEditable = this.toggleEditable.bind(this);
  }

  handleChange(e) {
    this.setState({ html: e.target.value });
  }

  handleKeyDown(e) {
    // only allow newlines with shift + enter
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      // TODO: submit
      this.setState({ html: "" });
    }
    // cmd/ctrl + b for bold
    if (e.keyCode === 66 && e.metaKey) {
      e.preventDefault();
      console.log("bold");
      document.execCommand("bold", false);
    }
    // cmd/ctrl + i for italic
    if (e.keyCode === 73 && e.metaKey) {
      e.preventDefault();
      console.log("italic");
      document.execCommand("italic", false);
    }
    // cmd/ctrl + u for underline
    if (e.keyCode === 85 && e.metaKey) {
      e.preventDefault();
      console.log("underline");
      document.execCommand("underline", false);
    }
  }

  sanitizeConf = {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "h1", "u"],
    allowedAttributes: { a: ["href"] },
  };

  sanitize() {
    this.setState({ html: sanitizeHtml(this.state.html, this.sanitizeConf) });
  }

  toggleEditable() {
    this.setState({ editable: !this.state.editable });
  }

  render() {
    return (
      <ContentEditable
        className={this.props.className}
        html={this.state.html} // innerHTML of the editable div
        disabled={!this.state.editable} // use true to disable edition
        onChange={this.handleChange} // handle innerHTML change
        onBlur={this.sanitize}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}
/*
<div>
  <h3>editable contents</h3>

  <h3>source</h3>
  <textarea
    className="editable"
    value={this.state.html}
    onChange={this.handleChange}
    onBlur={this.sanitize}
  />
  <h3>actions</h3>
  <EditButton cmd="italic" />
  <EditButton cmd="bold" />
  <EditButton cmd="formatBlock" arg="h1" name="heading" />
  <EditButton
    cmd="createLink"
    arg="https://github.com/lovasoa/react-contenteditable"
    name="hyperlink"
  />
  <button onClick={this.toggleEditable}>
    Make {this.state.editable ? "readonly" : "editable"}
  </button>
</div>; */

function EditButton(props) {
  return (
    <button
      key={props.cmd}
      onMouseDown={(evt) => {
        evt.preventDefault(); // Avoids loosing focus from the editable area
        document.execCommand(props.cmd, false, props.arg); // Send the command to the browser
      }}
    >
      {props.name || props.cmd}
    </button>
  );
}

export default TextEditor;
