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
    console.log("entered");
    console.log(caretPos, content, position);
    console.log(doc);
    return null;
};

const handleDelete = (doc, content, position) => {
    console.log("deleted");
    return null;
};

export { handleDrag, handleEnter, handleDelete };
