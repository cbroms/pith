import React from "react";
import DOMPurify from "dompurify";

import TextEditorLayout from "./TextEditorLayout";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: this.props.content || "",
      editable: true,
      queryStartPos: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sanitize = this.sanitize.bind(this);
    this.toggleEditable = this.toggleEditable.bind(this);
  }

  ref = React.createRef();

  sanitizeConf = {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "span",
      "div",
      "cite",
      "a",
      "p",
      "u",
    ],
  };

  sanitizeCompleteConf = {
    ALLOWED_TAGS: [],
  };

  handleChange(e) {
    this.setState({ html: e.target.value }, () => {
      // console.log(this.state.html);
      // if the state is empty, ensure the search is closed
      if (
        this.state.html.length === 0 ||
        (this.state.html.length === 4 && this.state.html === "<br>")
      ) {
        this.props.closeSearch();
      }

      // if we're in search mode, send the query
      if (this.state.queryStartPos !== null) {
        // completely sanitize the string
        const query = DOMPurify.sanitize(
          this.state.html.substring(
            this.state.queryStartPos,
            this.state.html.length
          ),
          this.sanitizeCompleteConf
        );

        this.props.setQuery(query);
      }
    });
  }

  getCaretPosition() {
    let sel = window.getSelection();
    if (sel.rangeCount) {
      return sel.getRangeAt(0).endOffset;
    }
    return null;
  }

  handleKeyDown(e) {
    // only allow newlines with shift + enter
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      // TODO: submit
      if (this.props.unitEnter) {
        this.props.unitEnter(this.getCaretPosition(), this.state.html);
      }
      this.setState({ html: "" });
    }
    // cmd/ctrl + b for bold
    if (e.keyCode === 66 && e.metaKey) {
      e.preventDefault();
      document.execCommand("bold", false);
    }
    // cmd/ctrl + i for italic
    if (e.keyCode === 73 && e.metaKey) {
      e.preventDefault();
      document.execCommand("italic", false);
    }
    // cmd/ctrl + u for underline
    if (e.keyCode === 85 && e.metaKey) {
      e.preventDefault();
      document.execCommand("underline", false);
    }
    // shift + > for start query
    if (e.keyCode === 190 && e.shiftKey) {
      // start the search
      this.setState({
        queryStartPos: this.state.html.includes("<br>")
          ? this.state.html.length
          : this.state.html.length + 4,
      });
      this.props.openSearch();
    }
    // on delete
    if (e.keyCode === 8) {
      let caretPos = this.getCaretPosition();
      // if we're in the first position, trigger the on unit delete
      if (caretPos === 0 && this.props.unitDelete) {
        this.props.unitDelete(this.state.html);
      }

      // check if the query start character has been deleted
      // add 3 to the caret pos because > is represented as &gt;
      if (caretPos + 3 === this.state.queryStartPos) {
        this.setState({ queryStartPos: null });
        this.props.closeSearch();
      }
    }
  }

  sanitize() {
    this.setState({
      html: DOMPurify.sanitize(this.state.html, this.sanitizeConf),
    });
  }

  toggleEditable() {
    this.setState({ editable: !this.state.editable });
  }

  render() {
    return (
      <TextEditorLayout
        {...this.props}
        showButton={this.props.showButton}
        innerRef={this.ref}
        className={this.props.className}
        html={this.state.html} // innerHTML of the editable div
        disabled={!this.state.editable} // use true to disable edition
        onChange={this.handleChange} // handle innerHTML change
        onFocus={this.props.onFocus || null}
        onBlur={() => {
          this.sanitize();
          if (this.props.onBlur) this.props.onBlur();
        }}
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

// function EditButton(props) {
//   return (
//     <button
//       key={props.cmd}
//       onMouseDown={(evt) => {
//         evt.preventDefault(); // Avoids loosing focus from the editable area
//         document.execCommand(props.cmd, false, props.arg); // Send the command to the browser
//       }}
//     >
//       {props.name || props.cmd}
//     </button>
//   );
// }

export default TextEditor;
