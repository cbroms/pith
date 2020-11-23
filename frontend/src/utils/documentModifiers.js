import { v4 as uuidv4 } from "uuid";
import { getDecodedLengthOfPith } from "./pithModifiers";

// get the next sibling up in the list that is not hidden
const getNextVisibleSibling = (siblingList, thisSibling, store) => {
    // get the index of the sibling
    const ind = siblingList.indexOf(thisSibling);
    console.log(ind);
    // iterate up from the sibling towards the start of the list
    for (let i = ind - 1; i >= 0; i--) {
        const thisSibling = store[siblingList[i]];
        // return when we find a visible sibling
        if (!thisSibling.hidden) return siblingList[i];
    }
    return null;
};

// given a document, handle inserting a dropped element and removing it from
// its previous position
const handleDrag = (store, dragged, dragTarget) => {
    // if we didn't drop the item on top of itself
    if (dragTarget !== null && dragged.id !== dragTarget.id) {
        // get the dragged item
        const draggingItemContent = store[dragged.id];
        draggingItemContent.children = draggingItemContent.children || [];

        // get the index of the target in the list
        const pos = store[dragTarget.pid].children.indexOf(dragTarget.id);

        // remove it from its old position
        const oldPos = store[dragged.pid].children.indexOf(dragged.id);
        store[dragged.pid].children.splice(oldPos, 1);

        // add the item to its new position
        if (dragTarget.asChild) {
            store[dragTarget.id].children.push(dragged.id);
        } else if (dragTarget.atEnd) {
            store[dragTarget.pid].children.splice(pos + 1, 0, dragged.id);
        } else {
            store[dragTarget.pid].children.splice(pos, 0, dragged.id);
        }
        return store;
    }
    return null;
};

const handleTab = (store, shift, id, pid, ppid) => {
    let newParent = null;
    let newPosition = null;

    if (pid !== null) {
        const pos = store[pid].children.indexOf(id);

        // if shift isn't down, make the unit a child
        if (!shift) {
            // check if the unit has a sibling above it
            // if there's no sibling, that means this is the first child of a unit and
            // there's nothing to tab into, so ignore the case
            const siblingId = getNextVisibleSibling(
                store[pid].children,
                id,
                store
            );

            if (siblingId !== null) {
                // add the unit as a child of the sibling
                store[siblingId].children.splice(
                    store[siblingId].children.length,
                    0,
                    id
                );
                newParent = siblingId;
                newPosition = 0;
                // remove it from its old position
                store[pid].children.splice(pos, 1);
            }
        } else {
            // if the shift was down, make the unit a sibling
            if (ppid !== null) {
                const parentPos = store[ppid].children.indexOf(pid);
                // insert after the parent unit
                store[ppid].children.splice(parentPos + 1, 0, id);
                newParent = ppid;
                newPosition = parentPos + 1;
                // remove it from its old position
                store[pid].children.splice(pos, 1);
            }
            // TODO: make sibling of current pith even though its out of render
            // i.e. ppid is null and pid is not
        }
    }
    return [newParent, newPosition, store];
};

// When a user pesses the return key, add a new unit after the current one.
// We want any content right of their cursor position in the current unit
// to be copied into the new unit.
const handleEnter = (store, caretPos, content, id, pid) => {
    let newUnitPith = content.substring(caretPos, content.length);
    let oldUnitPith = content.substring(0, caretPos);

    // check for a few cases where we want to clean up the new unit
    if (newUnitPith === "<br>") newUnitPith = "";
    if (newUnitPith.charAt(0) === " ")
        newUnitPith = newUnitPith.substring(1, newUnitPith.length - 1);
    if (newUnitPith === " ") newUnitPith = "";
    if (newUnitPith === "nbsp;" || newUnitPith.substring(0, 5) === "nbsp;") {
        // sometimes it breaks on a trailing space (&nbsp;) so fix the new unit and
        // remove the & from the old one. It consistenly breaks the & from the nbsp;
        newUnitPith = "";
        oldUnitPith = oldUnitPith.substring(0, oldUnitPith.length - 1);
    }

    // generate a new random id.
    // TODO: record this id and reconcile it with the new id received through
    // props for each new unit
    let newUnitId = uuidv4();
    const newUnit = {
        unit_id: newUnitId,
        pith: newUnitPith,
        children: [],
    };

    let pos;

    if (pid !== null) {
        pos = store[pid].children.indexOf(id);
        // add the unit as a child
        store[pid].children.splice(pos + 1, 0, newUnitId);
    } else {
        pos = 0;
        // add a child unit to the first position
        store[id].children.splice(0, 0, newUnitId);
    }

    // add the new unit to the store
    store[newUnitId] = newUnit;

    // console.log(caretPos);
    // console.log("new:", newUnitPith));

    return [oldUnitPith, newUnitPith, newUnitId, pos, store];
};

const handleDelete = (store, isEmpty, content, id, pid) => {
    if (pid !== null) {
        // get the deleted units position
        const pos = store[pid].children.indexOf(id);
        let newFocus = null;
        let newPosition;
        let newContent = null;

        const siblingId = getNextVisibleSibling(store[pid].children, id, store);

        if (siblingId === null) {
            // if it was in the first position, add its contents to the parent
            newPosition = getDecodedLengthOfPith(store[pid].pith);
            if (!isEmpty) {
                store[pid].pith += content;
                newContent = store[pid].pith;
            }
            newFocus = pid;
        } else {
            // add the content to the sibling above
            newPosition = getDecodedLengthOfPith(store[siblingId].pith);
            if (!isEmpty) {
                store[siblingId].pith += content;
                newContent = store[siblingId].pith;
            }
            newFocus = siblingId;
        }

        // hide the unit so we don't have to wait for the server update to see it hidden
        store[id].hidden = true;

        return [newFocus, newPosition, newContent, store];
    }
    return [null, null, null];
};

// edit the pith of a unit
const handleEdit = (store, content, id, pid) => {
    store[id].pith = content;
    return store;
};

export { handleDrag, handleEnter, handleDelete, handleTab, handleEdit };
