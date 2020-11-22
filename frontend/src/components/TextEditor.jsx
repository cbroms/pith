import React from "react";
import ReactDOM from "react-dom";
import DOMPurify from "dompurify";

import { getCaretPosition, setFocus } from "../utils/editorModifiers";
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
    } else {
      this.checkFocus();
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

      const focusedPosition =
        this.state.focusedPosition !== null
          ? this.state.focusedPosition
          : this.props.focusedPosition !== null
          ? this.props.focusedPosition
          : getDecodedLengthOfPith(this.state.html);

      setFocus(this.ref.current, focusedPosition, force);
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
    // reset the keypress timer so we don't end up sending the content twice!
    clearTimeout(this.keyPressTimer);
    this.keyPressTimer = null;
    // we have clicked away from the editor, so emit the changes
    if (this.props.unitEdit)
      this.props.unitEdit(this.sanitize(this.state.html));
    if (this.props.unitBlur) {
      this.props.unitBlur();
    }
    this.setState({ renderDisplay: true, editedSinceChange: false });
  }

  onFocus() {
    if (this.props.unitFocus) this.props.unitFocus();
    this.setState({ renderDisplay: false });
  }

  handleChange(e) {
    this.setState({ html: e.target.value, editedSinceChange: true }, () => {
      // periodically emit edit updates so the server can sync changes as they happen
      if (this.keyPressTimer === null) {
        this.keyPressTimer = setTimeout(() => {
          // emit the most recent state of the editor
          if (this.props.unitEdit)
            this.props.unitEdit(this.sanitize(this.state.html));

          // keep track of the fact we're now expecting props.content to change with this
          // most recent state. We don't want to update the content on this update, or it
          // will wipe out everything *after* the typed content
          // (taken care of by setting editedSinceChange to true)

          clearTimeout(this.keyPressTimer);
          this.keyPressTimer = null;
        }, 3000); // emit every three seconds
      }

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
        // remove the last added timer and wait another 500ms so the query is only made
        // when the user stops typing for 500ms
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
          // send the query
          if (query !== "") this.props.setQuery(query);
        }, 500);
      }
    });
  }

  getCaretPosition() {
    return getCaretPosition(this.ref.current, this.state.html);
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
          // TODO: rather than setting the state directly here, send this change to
          // the discussion parent, which would change the local store for this particular
          // unit
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
    return DOMPurify.sanitize(this.state.html, this.sanitizeConf);
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

export default TextEditor;
