import React from "react";
import ReactDOM from "react-dom";
import DOMPurify from "dompurify";

import {
  getCaretPosition,
  setFocus,
  addContent,
  standardizeContent,
} from "../utils/editorModifiers";
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
    console.log("mounted new", this.state.html);
    this.checkFocus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.content !== undefined &&
      this.props.content !== this.state.html &&
      !this.state.editedSinceChange
    ) {
      this.setState({ html: standardizeContent(this.props.content) });
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
        const newContent = addContent(
          this.state.html,
          this.props.contentToAdd,
          this.state.queryStartPos
        );

        const newAddedTransclusions = { ...this.state.addedTransclusions };
        newAddedTransclusions[
          this.props.contentToAdd
        ] = this.state.queryStartPos;

        // if this unit has a parent that controls its content, change the content
        // via the parent
        if (this.props.unitEdit) {
          // since we're adding this content programatically, ensure that we first
          // call on focus to re-aquire the edit lock.
          this.onFocus();
          this.props.unitEdit(newContent, () => {
            this.setState({
              html: newContent,
              editedSinceChange: true,
              addedTransclusions: newAddedTransclusions,
              queryStartPos: null,
              focusedPosition: getDecodedLengthOfPith(newContent),
            });
          });
        } else {
          this.setState(
            {
              html: newContent,
              addedTransclusions: newAddedTransclusions,
              queryStartPos: null,
              editedSinceChange: true,
              focusedPosition: getDecodedLengthOfPith(newContent),
            },
            () => {
              this.checkFocus(true);
            }
          );
        }
      } else {
        // otherwise, insert the content at the end

        const newAddedTransclusions = { ...this.state.addedTransclusions };
        newAddedTransclusions[this.props.contentToAdd] = 0;

        const newContent = addContent(this.state.html, this.props.contentToAdd);
        this.setState(
          {
            html: newContent,
            editedSinceChange: true,
            addedTransclusions: newAddedTransclusions,
            focusedPosition: getDecodedLengthOfPith(newContent),
          },
          () => {
            this.checkFocus(true);
          }
        );
      }
    } else {
      if (
        prevState.html !== this.state.html ||
        (this.props.focused && !prevProps.focused)
      ) {
        this.checkFocus();
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

      // console.log(this.state.focusedPosition);

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
      this.props.unitEdit(standardizeContent(this.sanitize(this.state.html)));
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
      if (this.props.temporary) {
        // if this is a temporary unit, update the parent element every update so it has a
        // perfect store of what's been edited. This is because when it is time to switch
        // the temporary unit out for the real unit, we want to know what was typed into it
        this.props.unitEdit(standardizeContent(this.sanitize(this.state.html)));
      } else {
        // periodically emit edit updates so the server can sync changes as they happen
        if (this.keyPressTimer === null) {
          this.keyPressTimer = setTimeout(() => {
            // emit the most recent state of the editor
            if (this.props.unitEdit)
              this.props.unitEdit(
                standardizeContent(this.sanitize(this.state.html))
              );

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
      // remove focus so the user can't keep typing in this text box
      document.activeElement.blur();
      // TODO: submit
      if (this.props.unitEnter) {
        // we expect unitEnter to return new content if we should reset the editor content
        const res = this.props.unitEnter(
          this.getCaretPosition()[1],
          this.state.html,
          DOMPurify.sanitize(this.state.html, this.sanitizeCompleteConf)
        );
        console.log("EDITING WITH", res);
        if (res) {
          this.setState({
            html: standardizeContent(res),
            editedSinceChange: true,
          });
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

        let queryPos,
          newContent,
          focusPos = null;

        if (
          this.state.html.substring(caretPos - 1, caretPos + 5) === "&nbsp;"
        ) {
          // in the case that the caret is on a space, add the space first, then add
          // the search query start, then any content afterwards
          newContent =
            this.state.html.slice(0, caretPos - 1) +
            " ><" +
            this.state.html.slice(caretPos - 1);
          queryPos = caretPos + 4;
          focusPos = caretPos + 1;
        } else {
          // otherwise just add in the search characters
          newContent =
            this.state.html.slice(0, caretPos) +
            ">&lt;" + // using &lt; here beacuse we don't want it to think that <blah is a broken tag
            this.state.html.slice(caretPos);
          queryPos = caretPos + 4;
          focusPos = caretPos + 1;
        }

        newContent = standardizeContent(newContent);

        this.setState(
          {
            html: newContent,
            editedSinceChange: true,
            queryStartPos: queryPos,
            focusedPosition: focusPos,
          },
          () => {
            this.checkFocus(true);
          }
        );

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
        this.setState(
          {
            queryStartPos: null,
            html:
              this.state.html.slice(0, this.state.queryStartPos - 4) +
              this.state.html.slice(this.state.queryStartPos + 4),
            focusedPosition: this.state.queryStartPos - 4,
          },
          () => {
            this.checkFocus(true);
          }
        );
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
