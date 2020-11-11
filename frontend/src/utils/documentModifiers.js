import { v4 as uuidv4 } from "uuid";

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

// When a user pesses the return key, add a new unit after the current one.
// We want any content right of their cursor position in the current unit
// to be copied into the new unit.
const handleEnter = (store, caretPos, content, position) => {
    let newUnitPith = content.substring(caretPos, content.length);

    if (newUnitPith === "<br>") newUnitPith = "";

    // generate a new random id.
    // TODO: record this id and reconcile it with the new id received through
    // props for each new unit
    let newUnitId = uuidv4();
    const newUnit = {
        unit_id: newUnitId,
        pith: newUnitPith,
        children: [],
    };

    if (position.child === null && position.grandchild === null) {
        // this is the top level element, so add a child at pos 0
        store[position.id].children = store[position.id].children || [];
        store[position.id].children.splice(0, 0, newUnitId);
    } else if (position.grandchild === null) {
        // add a sibling child
        store[position.parentId].children =
            store[position.parentId].children || [];
        store[position.parentId].children.splice(
            position.child + 1,
            0,
            newUnitId
        );
    } else {
        // add a sibling grandchild
        store[position.parentId].children =
            store[position.parentId].children || [];
        store[position.parentId].children.splice(
            position.grandchild + 1,
            0,
            newUnitId
        );
    }

    // add the new unit to the store
    store[newUnitId] = newUnit;

    // console.log(caretPos);
    // console.log("new:", newUnitPith));

    return [content.substring(0, caretPos), newUnitId, store];
};

const handleDelete = (store, isEmpty, content, position) => {
    //let pithCopy = pith;
    // attach the content to the unit above (sibling) or parent
    // if the deleted unit is first child of unit
    if (position.child !== null) {
        // remove the element from the doc
        if (position.grandchild !== null) {
            store[position.parentId].children.splice(position.grandchild, 1);
        } else {
            store[position.parentId].children.splice(position.child, 1);
        }
    }

    // remove the old item from the store
    // this isn't strictly necessary but should help with debugging
    delete store[position.id];

    let sibling = null;
    // get the sibling above the deleted element
    if (position.child !== null && position.grandchild === null) {
        sibling = store[position.parentId].children[position.child - 1];
    } else if (position.child !== null) {
        sibling = store[position.parentId].children[position.grandchild - 1];
    }

    // add the content to the previous sibling/parent
    if (!isEmpty) {
        if (position.child === 0 || position.grandchild === 0) {
            // add content to the end of the parent pith
            // this works for the first child and first grandchildren
            store[position.parentId].pith += " " + content;
            sibling = position.parentId;
        } else {
            // add content to the sibling above
            store[sibling].pith += " " + content;
        }
    }
    return [sibling, store];
};

// edit the pith of a unit
const handleEdit = (store, content, position) => {
    store[position.id].pith = content;
    return store;
};

export { handleDrag, handleEnter, handleDelete, handleEdit };
