import { escape } from "html-escaper";

const getCaretPosition = (topLevelElement, topLevelHtml) => {
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
      pos.endOffset === 0 && isFirstChild(start, topLevelElement);

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
      if (curr.parentElement?.innerHTML === topLevelHtml) {
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
};

const setFocus = (element, focusedPosition, force) => {
  console.log("sent:", element.innerHTML, focusedPosition);
  // set the cursor position in the element
  // this is wrapped in a timeout because we want it to excecute only after this.ref.current
  // has updated from the rerender
  window.setTimeout(() => {
    // make sure we haven't *just* focused, since there's no other way to tell if we already
    // updated focus since we're using a timeout and reference (no state info here)
    if (document.activeElement !== element || force) {
      //this.ref.current.focus();
      const setpos = document.createRange();
      const set = window.getSelection();
      // console.log(this.ref.current.childNodes);

      let position = focusedPosition;
      let targetNode = element.childNodes[0] || element;
      let lenSoFar = 0;

      let prevNode = targetNode;

      // find the node to focus in
      for (const node of element.childNodes) {
        prevNode = targetNode;
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

      console.log("setting:", targetNode, position);

      try {
        setpos.setStart(targetNode, position);
      } catch {
        // it sometimes happens that we try to set the position in a br element
        // in this case, set the position at the end of the previous element
        // TODO this is a nasty hack btw and we should fix it
        const pos = prevNode.innerHTML?.length || prevNode.textContent.length;
        setpos.setStart(prevNode, pos);
      }

      setpos.collapse(true);
      set.removeAllRanges();
      set.addRange(setpos);
      element.focus();
    }
  }, 0);
};

// check the end of the string and ensure it ends in a space followed by a break
const standardizeContent = (content) => {
  // check if there are two spaces at the end
  const doubleEnd = content.substring(content.length - 12, content.length);
  // if there is one space at the end
  const singleEnd = doubleEnd.substring(6, 12);

  if (doubleEnd === "&nbsp;&nbsp;") {
    content = content.substring(0, content.length - 7) + "<br>";
  } else if (singleEnd === "&nbsp;") {
    content += "<br>";
  }

  // const brEnd = content.substring(content.length - 4, content.length);
  // console.log(brEnd);

  // if (brEnd !== "<br>") {
  //   content += "<br>";
  // }

  return content;
};

// add some content to the pith at the position where the search query started with ">"
const addContent = (content, contentToAdd, position) => {
  // get the end position of the search
  const end = content.substring(position, content.length);

  // add the citation where the search was
  let newContent = [
    content.slice(0, position - 4), // subtracting 4 to account for the &gt;
    contentToAdd,
    content.slice(position + end.indexOf("&lt;") + 4),
  ].join("");

  return standardizeContent(newContent);
};
export { getCaretPosition, setFocus, addContent, standardizeContent };
