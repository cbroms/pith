import React from "react";
import ReactDOM from "react-dom";
import DOMPurify from "dompurify";
import { escape } from "html-escaper";

import { getDecodedLengthOfPith } from "../utils/pithModifiers";

import TextEditorLayout from "./TextEditorLayout";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: this.props.content || "",
      renderDisplay: !this.props.focused,
      addedTransclusions: {},
      editedSinceChange: false,
      editable: true,
      queryStartPos: null,
      queryEndPos: null,
      focusedPosition: null,
    };

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sanitize = this.sanitize.bind(this);
    this.toggleEditable = this.toggleEditable.bind(this);

    this.checkFocus = this.checkFocus.bind(this);
  }

  keyPressTimer = null;
  timeSinceLast = 0;
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

    // TODO: make this work for when someone tries to add two references to the same unit
    if (
      this.props.contentToAdd &&
      !Object.keys(this.state.addedTransclusions).includes(
        this.props.contentToAdd
      )
    ) {
      // if we have a query started, add this content where the query was
      if (this.state.queryStartPos !== null) {
        // get the end position of the search
        const end = this.state.html.substring(
          this.state.queryStartPos,
          this.state.html.length
        );

        // add the citation where the search was
        const newContent = [
          this.state.html.slice(0, this.state.queryStartPos - 4),
          this.props.contentToAdd,
          this.state.html.slice(
            this.state.queryStartPos + end.indexOf("&lt;") + 4
          ),
        ].join("");

        const newAddedTransclusions = { ...this.state.addedTransclusions };
        newAddedTransclusions[
          this.props.contentToAdd
        ] = this.state.queryStartPos;
        this.setState(
          {
            html: newContent,
            addedTransclusions: newAddedTransclusions,
            queryStartPos: null,
            focusedPosition: getDecodedLengthOfPith(newContent) - 5,
          },
          () => {
            this.checkFocus(true);
          }
        );
      }
    }

    //TODO check for renderedContent update too
  }

  checkFocus(force) {
    if (
      force ||
      (this.props.focused && document.activeElement !== this.ref.current)
    ) {
      // console.log(this.props.focusedPosition);
      // console.log("checking focus ");

      // set the cursor position in the element
      // this is wrapped in a timeout because we want it to excecute only after this.ref.current
      // has updated from the rerender
      window.setTimeout(() => {
        // make sure we haven't *just* focused, since there's no other way to tell if we already
        // updated focus since we're using a timeout and reference (no state info here)
        if (document.activeElement !== this.ref.current || force) {
          //this.ref.current.focus();
          const setpos = document.createRange();
          const set = window.getSelection();
          // console.log(this.ref.current.childNodes);

          const focusedPosition =
            this.state.focusedPosition !== null
              ? this.state.focusedPosition
              : this.props.focusedPosition !== null
              ? this.props.focusedPosition
              : getDecodedLengthOfPith(this.state.html);

          let position = focusedPosition;
          let targetNode = this.ref.current.childNodes[0] || this.ref.current;
          let lenSoFar = 0;

          // find the node to focus in
          for (const node of this.ref.current.childNodes) {
            targetNode = node;
            let length = 0;
            // get the length of the content
            if (node.nodeName === "#text") length = node.textContent.length;
            else length = node.innerHTML.length + node.nodeName.length * 2 + 5;

            if (lenSoFar + length >= focusedPosition) {
              // we found the node we should be focusing in
              // now get the position within the node we should place the cursor
              if (lenSoFar === 0) position = focusedPosition;
              else {
                position = length - (lenSoFar + length - focusedPosition);
                // add the number of citation tags to the position since we're adding the cite:
                // decorator through css which adds to the total length so add the number of
                // characters in the dectorator
                // if (node.nodeName === "CITE") position += 5;
              }
              break;
            } else lenSoFar += length;
          }

          // console.log("setting:", targetNode, position);

          setpos.setStart(targetNode, position);
          setpos.collapse(true);
          set.removeAllRanges();
          set.addRange(setpos);
          this.ref.current.focus();
        }
      }, 50);
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
        // remove the last added timer and wait another 500ms
        clearTimeout(this.keyPressTimer);
        // this is called when the user stops typing
        this.keyPressTimer = setTimeout(() => {
          // get the end position of the search
          const end = this.state.html.substring(
            this.state.queryStartPos,
            this.state.html.length
          );

          // extract the query from between the start position and end
          const queryRaw = end.substring(0, end.indexOf("&lt;"));
          // completely sanitize the string
          const query = DOMPurify.sanitize(queryRaw, this.sanitizeCompleteConf);
          if (query !== "") this.props.setQuery(query);
        }, 500);
      }
    });
  }

  getCaretPosition() {
    let sel = window.getSelection();
    if (sel.rangeCount) {
      // get the caret position (this is in the rendered text)
      const pos = sel.getRangeAt(0);
      const start = pos.endContainer;
      let startOffset = pos.endOffset;

      // console.log("pos:", start, startOffset);

      // we need to ensure the string doesn't contain any encoded html entities, or else
      // the offset provided will be shorter (account for cases like ">" -> "&gt;")
      if (start.textContent.length !== escape(start.textContent).length) {
        let adjustedLen = 0;
        for (let i = 0; i < startOffset; i++) {
          const char = start.textContent.charAt(i);
          // for some reason our content editable element doesn;t encode ' and " as html entities,
          // so only escape the char if it isnt one of those
          if (!['"', "'"].includes(char)) {
            adjustedLen += escape(char).length;
          } else adjustedLen += 1;
        }

        startOffset = adjustedLen;
      }
      // console.log(startOffset);

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
                ? escape(pChild.textContent).length
                : pChild.innerHTML.length + tagNameOffset;
          }
        } else {
          return 0;
        }

        // return the offset when we get to the top level element
        if (curr.parentElement?.innerHTML === this.state.html) {
          return offset;
        }

        // add the offsets of the parent's children up to the current elt
        return getOffset(curr.parentElement, offset);
      };

      // get the offset of the cursor position in DOM tree so that it's relative to
      // the top level element
      const offset = isAtStart ? 0 : getOffset(start, startOffset);

      // console.log("offset:", offset);
      // console.log(this.state.html.substring(0, offset));
      // console.log([isAtStart, offset]);
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
          this.state.html,
          DOMPurify.sanitize(this.state.html, this.sanitizeCompleteConf)
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
        e.preventDefault();

        let [caretAtStart, caretPos] = this.getCaretPosition();

        // in the case that the caret is on a space, remove the space first, then add
        // the content, then place the space back afterward
        if (
          this.state.html.substring(caretPos - 1, caretPos + 5) === "&nbsp;"
        ) {
          this.setState(
            {
              queryStartPos: caretPos + 3,
              html:
                this.state.html.slice(0, caretPos - 1) +
                "><" +
                this.state.html.slice(caretPos - 1),
              focusedPosition: caretPos,
            },
            () => {
              this.checkFocus(true);
            }
          );
        } else {
          this.setState(
            {
              queryStartPos: caretPos + 4,
              html:
                this.state.html.slice(0, caretPos) +
                "><" +
                this.state.html.slice(caretPos),
              focusedPosition: caretPos + 1,
            },
            () => {
              this.checkFocus(true);
            }
          );
        }
        // set the start position of the query and add the closing "<"

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
      if (caretPos === this.state.queryStartPos) {
        this.setState({
          queryStartPos: null,
          html:
            this.state.html.slice(0, this.state.queryStartPos - 4) +
            this.state.html.slice(this.state.queryStartPos + 4),
        });
        e.preventDefault();
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
        showRendered={
          this.state.renderDisplay &&
          this.props.showRenderDisplay &&
          !this.props.focused
        }
        disabled={!this.state.editable}
        onChange={this.handleChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onKeyDown={this.handleKeyDown}
        makeSubmit={() => {
          this.props.unitEnter(this.getCaretPosition()[1], this.state.html);
          this.setState({
            html: "",
            addedTransclusions: {},
            focusedPosition: null,
          });
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
