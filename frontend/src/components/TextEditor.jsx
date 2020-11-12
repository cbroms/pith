import React from "react";
import ReactDOM from "react-dom";
import DOMPurify from "dompurify";
// import { escape } from "html-escaper";

import TextEditorLayout from "./TextEditorLayout";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: this.props.content || "",
      renderDisplay: false,
      editedSinceChange: false,
      editable: true,
      queryStartPos: null,
    };

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sanitize = this.sanitize.bind(this);
    this.toggleEditable = this.toggleEditable.bind(this);

    this.checkFocus = this.checkFocus.bind(this);
  }

  ref = React.createRef();

  componentDidMount() {
    this.checkFocus();
  }

  componentDidUpdate() {
    if (
      this.props.content !== undefined &&
      this.props.content !== this.state.html &&
      !this.state.editedSinceChange
    ) {
      this.setState({ html: this.props.content });
    }
    this.checkFocus();

    //TODO check for renderedContent update too
  }

  checkFocus() {
    if (this.props.focused && document.activeElement !== this.ref.current) {
      console.log("checking focus ");

      // remove the prior focus and move the cursor to the first position in this
      // element
      // window.setTimeout(() => {
      try {
        this.ref.current.focus();
        const setpos = document.createRange();
        const set = window.getSelection();
        const last = this.ref.current.childNodes[
          this.ref.current.childNodes.length - 1
        ];
        console.log(this.ref.current);
        setpos.setStart(last, last.textContent.length);
        setpos.collapse(true);
        set.removeAllRanges();
        set.addRange(setpos);
        this.ref.current.focus();
      } catch {
        console.log("couldn't set focus");
      }
      //   }, 50);
    }
  }

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

  onBlur() {
    this.sanitize();
    this.setState({ renderDisplay: true, editedSinceChange: false });
    if (this.props.onBlur) this.props.onBlur(this.state.html);
  }

  onFocus() {
    if (this.props.onFocus) this.props.onFocus();
    this.setState({ renderDisplay: false });
  }

  handleChange(e) {
    this.setState({ html: e.target.value, editedSinceChange: true }, () => {
      // TODO: time the duration that we've been editing, and periodically
      // emit updates to the server. This should change props.content, so we
      // want to keep a copy of all teh content created after the emit, then
      // add it to the end of the new content, and adjust the cursor position.

      // TODO: add a color difference around text that is not yet updated on
      // the server (make it grey) like https://stackoverflow.com/a/38037538

      // if the state is empty, ensure the search is closed
      if (
        this.state.html.length === 0 ||
        (this.state.html.length === 4 && this.state.html === "<br>")
      ) {
        if (this.props.closeSearch) this.props.closeSearch();
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
      // get the caret position (this is in the rendered text)
      const pos = sel.getRangeAt(0);
      const start = pos.endContainer;
      const startOffset = pos.endOffset;

      // is the comparison element in one of the element's children in pos 0?
      const isFirstChild = (comp, elt) => {
        if (elt === comp) return true;
        else if (elt.childNodes.length > 0) {
          return isFirstChild(comp, elt.childNodes[0]);
        } else {
          return false;
        }
      };

      // is the cursor in the first position?
      const isAtStart =
        pos.endOffset === 0 && isFirstChild(start, this.ref.current);

      const getOffset = (curr, offset) => {
        // add the length of the element's start tag to the offset
        const tagNameOffset =
          curr.nodeName === "#text" || curr.nodeName === "SPAN"
            ? 0
            : curr.nodeName.length + 2;
        offset += tagNameOffset;

        // return the offset when we get to the top level element
        if (curr.parentElement?.innerHTML === this.state.html) {
          return offset;
        }

        // sum the lengths of the children before the current elt in the list
        if (curr.parentElement !== null) {
          for (const pChild of curr.parentElement.childNodes) {
            if (pChild === curr) {
              break;
            }

            // add both start and end tag offset length for a child element
            const tagNameOffset =
              pChild.nodeName === "#text" ? 0 : 2 * pChild.nodeName.length + 5;

            //  increase the length of the offset with the element's content
            offset +=
              tagNameOffset === 0
                ? pChild.textContent.length
                : pChild.innerHTML.length + tagNameOffset;
          }
        } else {
          return 0;
        }

        // add the offsets of the parent's children up to the current elt
        return getOffset(curr.parentElement, offset);
      };

      // get the offset of the cursor position in DOM tree so that it's relative to
      // the top level element
      const offset = isAtStart ? 0 : getOffset(start, startOffset);

      // console.log("offset:", offset);
      // console.log(this.state.html.substring(0, offset));
      console.log([isAtStart, offset]);
      return [isAtStart, offset];
    }
    return null;
  }

  handleKeyDown(e) {
    // only allow newlines with shift + enter
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      // TODO: submit
      if (this.props.unitEnter) {
        // we expect unitEnter to return true if we should reset the editor content
        const res = this.props.unitEnter(
          this.getCaretPosition()[1],
          this.state.html
        );
        if (res) {
          this.setState({ html: res, editedSinceChange: true });
        } else {
          this.setState({ html: "", editedSinceChange: true });
        }
      }
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
      if (this.props.openSearch) {
        // start the search
        this.setState({
          queryStartPos: this.state.html.includes("<br>")
            ? this.state.html.length
            : this.state.html.length + 4,
        });
        this.props.openSearch();
      }
    }
    // on tab
    if (e.keyCode === 9) {
      if (this.props.unitTab) {
        this.onBlur();
        this.props.unitTab(e.shiftKey);
      }
      e.preventDefault();
    }
    // on delete
    if (e.keyCode === 8) {
      let [caretAtStart, caretPos] = this.getCaretPosition();
      // if we're in the first position, trigger the on unit delete
      if (caretAtStart && this.props.unitDelete) {
        // completely sanitize the string and check its length
        const isEmpty =
          DOMPurify.sanitize(this.state.html, this.sanitizeCompleteConf)
            .length === 0;
        if (this.props.unitDelete)
          this.props.unitDelete(isEmpty, this.state.html);
        e.preventDefault();
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
        focused={this.props.focused}
        html={this.state.html}
        renderedContent={this.props.renderedContent}
        showRendered={this.state.renderDisplay && this.props.showRenderDisplay}
        disabled={!this.state.editable}
        onChange={this.handleChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onKeyDown={this.handleKeyDown}
        makeSubmit={() => {
          this.props.unitEnter(this.getCaretPosition()[1], this.state.html);
        }}
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
