// insert a child into a position in the document
const insertChild = (doc, position, content) => {
    if (position.grandchild !== undefined) {
        doc[position.child].children.splice(position.grandchild, 0, content);
    } else if (position.child !== undefined) {
        doc.splice(position.child, 0, content);
    }

    return doc;
};

// given a document, handle inserting a dropped element and removing it from
// its previous position
const handleDrag = (doc, dragged, dragTarget) => {
    // if we didn't drop the item on top of itself
    if (
        !(
            dragged.child === dragTarget.child &&
            dragged.grandchild === dragTarget.grandchild
        )
    ) {
        // get the dragged item
        const draggingItemContent =
            dragged.grandchild !== null
                ? {
                      ...doc[dragged.child].children[dragged.grandchild],
                  }
                : { ...doc[dragged.child] };

        draggingItemContent.children = draggingItemContent.children || [];

        let oldChildIndex = dragged.child;
        let oldGrandchildIndex = dragged.grandchild;

        // add the item to its new position
        if (!dragTarget.asChild && dragTarget.grandchild !== null) {
            // add a grandchild
            if (dragTarget.grandchild <= oldGrandchildIndex) {
                oldGrandchildIndex += 1;
            }
            const newGrandchildPos = dragTarget.atEnd
                ? dragTarget.grandchild + 1
                : dragTarget.grandchild;

            doc = insertChild(
                doc,
                { child: dragTarget.child, grandchild: newGrandchildPos },
                draggingItemContent
            );
        } else if (!dragTarget.asChild) {
            // add a child
            if (dragTarget.child <= oldChildIndex) {
                if (!dragTarget.atEnd) oldChildIndex += 1;
            }
            const newChildPos = dragTarget.atEnd
                ? dragTarget.child + 1
                : dragTarget.child;

            doc = insertChild(doc, { child: newChildPos }, draggingItemContent);
        } else if (dragTarget.asChild && dragTarget.grandchild !== null) {
            // do nothing, this is making the unit a child of a grandchild so it is
            // outside of the render scope
        } else {
            // make a grandchild
            const index = dragTarget.atEnd
                ? doc[dragTarget.child].children.length - 1
                : 0;

            doc = insertChild(
                doc,
                { child: dragTarget.child, grandchild: index },
                draggingItemContent
            );
        }

        // remove the item from its previous position
        if (dragged.grandchild !== null) {
            console.log("removing", oldGrandchildIndex, "from", oldChildIndex);
            doc[oldChildIndex].children.splice(oldGrandchildIndex, 1);
        } else {
            doc.splice(oldChildIndex, 1);
        }

        return doc;
    }
    return null;
};

const handleEnter = (doc, caretPos, content, position) => {
    const newUnitPith = content.substring(caretPos, content.length);
    let focused = "temp1";

    if (position.child === null && position.grandchild === null) {
        // this is the top level element, so add a child at pos 0
        console.log(doc);
        doc.splice(0, 0, { unit_id: "temp1", pith: newUnitPith, children: [] });
    } else if (position.grandchild === null) {
        // add a sibling child
        doc.splice(position.child + 1, 0, {
            unit_id: "temp1",
            pith: newUnitPith,
            children: [],
        });
    } else {
        // add a sibling grandchild
        doc[position.child].children.splice(position.grandchild + 1, 0, {
            unit_id: "temp1",
            pith: newUnitPith,
            children: [],
        });
    }

    console.log(caretPos);

    console.log("new:", content.substring(0, caretPos));

    return [content.substring(0, caretPos), focused, doc];
};

const handleDelete = (pith, doc, isEmpty, content, position) => {
    console.log("deleted");
    let pithCopy = pith;
    // attach the content to the unit above (sibling) or parent
    // (if the deleted unit is first child of unit)
    if (position.child !== null) {
        // remove the element from the doc
        if (position.grandchild !== null) {
            doc[position.child].children.splice(position.grandchild, 1);
        } else {
            doc.splice(position.child, 1);
        }
    }

    // add the content to the previous sibling/parent
    if (!isEmpty) {
        if (position.child === 0 && position.grandchild === null) {
            // add content to the end of the parent pith
            pithCopy += " " + content;
        } else if (position.grandchild === 0) {
            // add the grandchild content to the child above
            doc[position.child].pith += " " + content;
        } else if (position.grandchild === null) {
            // add content to the sibling child above
            doc[position.child - 1].pith += " " + content;
        } else {
            // add content to the sibling grandchild above
            doc[position.child].children[position.grandchild - 1].pith +=
                " " + content;
        }
    }
    console.log(doc);
    return [pithCopy, doc];
};

export { handleDrag, handleEnter, handleDelete };
