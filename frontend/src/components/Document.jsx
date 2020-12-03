import React from "react";

import {
    handleDrag,
    handleEnter,
    handleDelete,
    handleTab,
    handleEdit,
} from "../utils/documentModifiers";

import { getDecodedLengthOfPith } from "../utils/pithModifiers";

import Unit from "./Unit";
import AncestorsLayout from "./AncestorsLayout";
import DocumentLayout from "./DocumentLayout";
import TimelineLayout from "./TimelineLayout";
import DocumentSectionLayout from "./DocumentSectionLayout";
import UsersLayout from "./UsersLayout";

class Document extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tempUnitCopy: this.props.docMap, // a temporary copy of the unit store while we're editing
            tempIdMap: {},
            tempContent: {},
            dragged: null,
            dragTarget: null,
            focused: null,
            focusedPosition: null,
            waitingForNew: null,
        };

        this.getStore = this.getStore.bind(this);
        this.getStoreCopy = this.getStoreCopy.bind(this);

        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);

        this.onUnitDelete = this.onUnitDelete.bind(this);
        this.onUnitEnter = this.onUnitEnter.bind(this);
        this.onUnitEdit = this.onUnitEdit.bind(this);
        this.onUnitTab = this.onUnitTab.bind(this);
        this.onUnitFocus = this.onUnitFocus.bind(this);
        this.onUnitBlur = this.onUnitBlur.bind(this);

        this.getUnitRealId = this.getUnitRealId.bind(this);
        this.getUnitTempId = this.getUnitTempId.bind(this);
        this.getDragInfo = this.getDragInfo.bind(this);
    }

    componentDidUpdate(prevProps) {
        // if (this.props.docMap === null && prevProps !== null) {
        //     this.setState({ tempUnitCopy: prevProps });
        // }
        if (
            this.state.waitingForNew !== null &&
            this.props.newUnitId !== undefined
        ) {
            console.log("update after waiting for new");

            // aquire focus
            this.props.onUnitFocus(this.props.newUnitId);
            // add the temporary id into the map of temporary ids to real ids
            const tempIdMap = this.state.tempIdMap;
            tempIdMap[this.state.waitingForNew] = this.props.newUnitId;
            tempIdMap[this.props.newUnitId] = this.state.waitingForNew;

            const tempContentCopy = this.state.tempContent;
            tempContentCopy[this.state.waitingForNew].temporary = false;
            this.setState({
                tempIdMap: tempIdMap,
                tempContent: tempContentCopy,
                waitingForNew: null,
                focusedPosition: null,
            });
        }
    }

    // get a unit's real id (not the temporary one assigned by the client if it exists)
    getUnitRealId(id) {
        if (id === null) return null;
        else if (id.substring(0, 4) === "temp") {
            if (this.state.tempIdMap[id]) return this.state.tempIdMap[id];
            else return null;
        }
        return id;
    }

    getUnitTempId(id) {
        if (id === null) return null;
        else if (id.substring(0, 4) === "temp") {
            return id;
        } else {
            if (this.state.tempIdMap[id]) return this.state.tempIdMap[id];
            return id;
        }
    }

    // return whichever store we're using (locally modified or global from props)
    getStore() {
        if (this.props.docMap === null) {
            // use the copy since some request is pending and the state is not up to date
            // with the local version we have stored
            //console.log("returning local copy");
            return { ...this.state.tempContent, ...this.state.tempUnitCopy };
        } else {
            //console.log("returning live");
            return { ...this.state.tempContent, ...this.props.docMap };
        }
    }

    // get a copy of whichever store we're using,
    getStoreCopy() {
        const store = this.getStore();
        return { ...store };
    }

    onUnitDelete(isEmpty, content, id, pid) {
        const realId = this.getUnitRealId(id);
        const realParentId = this.getUnitRealId(pid);

        // release the edit lock, then delete
        this.props.onUnitBlur(realId);
        this.props.onUnitDelete(realId);

        const store = this.getStoreCopy();
        const [focused, focusedPosition, newContent, newStore] = handleDelete(
            store,
            isEmpty,
            content,
            realId,
            realParentId,
            id
        );
        //
        const toFocus = this.getUnitTempId(focused);
        if (newStore !== null) {
            this.setState(
                {
                    focused: toFocus,
                    focusedPosition: focusedPosition,
                    tempUnitCopy: newStore,
                },
                () => {
                    this.props.onUnitFocus(focused);
                    if (newContent !== null && newContent !== "")
                        this.props.onUnitEdit(focused, newContent);
                }
            );
        }
    }

    onUnitTab(shifted, id, pid, ppid) {
        const store = this.getStoreCopy();
        const [newParent, newPosition, newStore] = handleTab(
            store,
            shifted,
            id,
            pid,
            ppid
        );

        if (newParent !== null) {
            const realId = this.getUnitRealId(id);
            this.props.onUnitMove(realId, newParent, newPosition);
        }

        if (newStore !== null) {
            this.setState({
                tempUnitCopy: newStore,
            });
        }
    }

    onUnitEnter(caretPos, content, id, pid) {
        const realId = this.getUnitRealId(id);
        const realParentId = this.getUnitRealId(pid);

        const store = this.getStoreCopy();
        const [newContent, newUnitPith, focused, pos, newStore] = handleEnter(
            store,
            caretPos,
            content,
            realId,
            realParentId
        );

        if (newContent !== content) {
            // if the new content is different than the old,
            // reaquire the edit lock and edit the unit to have the new content
            this.props.onUnitFocus(realId);
            this.props.onUnitEdit(realId, newContent);
            this.props.onUnitBlur(realId);
        }

        if (newStore !== null) {
            this.setState({
                tempContent: {
                    ...this.state.tempContent,
                    [focused]: { ...newStore[focused] },
                },
                waitingForNew: focused,
                focused: focused,
                focusedPosition: 0,
                tempUnitCopy: newStore,
            });
        }

        // if the use hit enter on the top level unit, make a child rather than sibling

        if (pid === null) this.props.onUnitCreate(newUnitPith, realId, -1);
        else this.props.onUnitCreate(newUnitPith, realParentId, pos);
        //
        return newContent;
    }

    onUnitEdit(content, id, callback) {
        if (content !== "") {
            const realId = this.getUnitRealId(id);
            if (realId !== null) this.props.onUnitEdit(realId, content);
            else {
                const tempContentCopy = this.state.tempContent;
                tempContentCopy[id].pith = content;
                this.setState({ tempContent: tempContentCopy });
            }

            const store = this.getStoreCopy();
            const newStore = handleEdit(store, content, id);
            if (newStore !== null) {
                this.setState(
                    {
                        tempUnitCopy: newStore,
                    },
                    () => {
                        if (callback) callback();
                    }
                );
            }
        }
    }

    onUnitFocus(id, pith) {
        const realId = this.getUnitRealId(id);
        if (realId !== null) this.props.onUnitFocus(realId);
        this.setState({
            focused: id,
            focusedPosition: getDecodedLengthOfPith(pith),
        });
    }

    onUnitBlur(id) {
        const realId = this.getUnitRealId(id);
        if (realId !== null) this.props.onUnitBlur(realId);
        if (this.state.focused === id) this.setState({ focused: null });
    }

    handleDragEnd(e) {
        // TODO: change this
        const store = this.getStoreCopy();

        const newDoc = handleDrag(
            store,
            this.state.dragged,
            this.state.dragTarget
        );

        this.setState({
            dragTarget: null,
        });

        // if (newDoc !== null) {
        //     this.setState({
        //         dragged: null,
        //         dragTarget: null,
        //         documentCopy: newDoc,
        //     });
        // }
    }

    getDragInfo(id) {
        const over = this.state.dragTarget?.id === id;

        const overAsChild = over && this.state.dragTarget?.asChild;
        const overAtEnd = over && this.state.dragTarget?.atEnd;
        return [over, overAsChild, overAtEnd];
    }

    handleDragStart(e, id, pid) {
        this.setState({
            dragged: {
                id: id,
                pid: pid,
            },
        });
    }

    handleDragEnter(e, id, pid, asChild, atEnd) {
        const targ = this.state.dragTarget;
        if (
            targ === null ||
            targ.id !== id ||
            targ.asChild !== asChild ||
            targ.atEnd !== atEnd
        ) {
            this.setState({
                dragTarget: {
                    id: id,
                    pid: pid,
                    asChild: asChild,
                    atEnd: atEnd,
                },
            });
        }
    }

    render() {
        // create a unit for a given location
        const createUnit = (unit, id, pid, ppid) => {
            const editable =
                unit.editLock === null || unit.editLock === this.props.userId;

            return (
                <Unit
                    editable={editable}
                    temporary={unit.temporary}
                    lockedBy={
                        unit.editLock !== this.props.userId
                            ? this.props.icons[unit.editLock]?.nickname
                            : undefined
                    }
                    hidden={unit.hidden}
                    unitEnter={(pos, content) =>
                        this.onUnitEnter(pos, content, id, pid)
                    }
                    unitDelete={(isEmpty, content) =>
                        this.onUnitDelete(isEmpty, content, id, pid)
                    }
                    unitEdit={(content, callback) => {
                        this.onUnitEdit(content, id, callback);
                    }}
                    unitTab={(shifted) =>
                        this.onUnitTab(shifted, id, pid, ppid)
                    }
                    unitFocus={() => {
                        this.onUnitFocus(id, unit.pith);
                    }}
                    unitBlur={() => {
                        this.onUnitBlur(id);
                    }}
                    focused={this.state.focused === id}
                    focusedPosition={
                        this.state.focused === id
                            ? this.state.focusedPosition
                            : null
                    }
                    contentToAdd={
                        this.props.transclusionUnitId === id
                            ? this.props.transclusionToAdd
                            : null
                    }
                    openSearch={this.props.openSearch}
                    closeSearch={this.props.closeSearch}
                    setQuery={(query) => this.props.setQuery(query, id)}
                    getUnitContext={this.props.getUnitContext}
                    gettingUnitContext={this.props.gettingUnitContext}
                    units={store}
                    placeholder={"type a pith..."}
                    pith={unit.pith}
                    id={id}
                    inline
                />
            );
        };

        const createSection = (unit, content, id, pid, isLast, pith, level) => {
            const [over, asChild, atEnd] = this.getDragInfo(id);

            return (
                <DocumentSectionLayout
                    hidden={unit.hidden}
                    draggable={this.state.focused !== id}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={(e) => this.handleDragStart(e, id, pid)}
                    onDragEnter={(e, asChild, atEnd) =>
                        this.handleDragEnter(e, id, pid, asChild, atEnd)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onUnitEnter={() => this.props.openUnit(id)}
                    over={over}
                    overAsChild={asChild}
                    overAtEnd={atEnd}
                    last={isLast}
                    level={level}
                    key={id}
                    pith={pith}
                >
                    {content}
                </DocumentSectionLayout>
            );
        };

        const store = this.getStore();
        // console.log(store);

        // create the sections in the doc with children + grandchildren
        const sections = store[this.props.currentUnit]?.children?.map(
            (childId, childIndex) => {
                // don't render units that have temp units already

                // TODO when the real unit is added it seems to remount the fake one
                // which causes the cursor postion to reset, breaking the text input.
                // Somehow prevent this case by perhaps checking if the unit is
                // temporary and has a real id in the store, in which case render the
                // real one not the temp one...

                const realChildId = this.getUnitRealId(childId);

                if (
                    realChildId !== childId &&
                    store[realChildId] !== undefined
                ) {
                    console.log(realChildId, childId);
                }

                const workingChildId = this.getUnitTempId(childId);

                let child = store[workingChildId];

                if (workingChildId !== childId) {
                    child.temporary = false;
                }

                // create the grandchild sections for each child
                const grandchildren = store[workingChildId]?.children?.map(
                    (grandchildId, grandchildIndex) => {
                        const workingGrandchildId = this.getUnitTempId(
                            grandchildId
                        );

                        const grandchild = store[workingGrandchildId];
                        return createSection(
                            grandchild,
                            null,
                            workingGrandchildId,
                            workingChildId,
                            grandchildIndex === child.children.length - 1,
                            createUnit(
                                grandchild,
                                workingGrandchildId,
                                workingChildId,
                                this.props.currentUnit
                            ),
                            3
                        );
                    }
                );

                // create the child section
                return createSection(
                    child,
                    grandchildren,
                    workingChildId,
                    this.props.currentUnit,
                    childIndex ===
                        store[this.props.currentUnit].children.length - 1,
                    createUnit(
                        child,
                        workingChildId,
                        this.props.currentUnit,
                        null
                    ),
                    2
                );
            }
        );

        const pithUnit = createUnit(
            store[this.props.currentUnit],
            this.props.currentUnit,
            null,
            null
        );

        const doc = (
            <DocumentSectionLayout
                focused={this.state.focused === this.props.currentUnit}
                level={1}
                pith={pithUnit}
                onDragEnter={() => null}
            >
                {sections}
            </DocumentSectionLayout>
        );

        const timeline = (
            <TimelineLayout
                pages={this.props.timeline}
                openUnit={this.props.openUnit}
                units={store}
            />
        );
        const ancestors = (
            <AncestorsLayout
                ancestors={this.props.ancestors}
                currentUnit={this.props.currentUnit}
                openUnit={this.props.openUnit}
                units={store}
                getUnitContext={this.props.getUnitContext}
                gettingUnitContext={this.props.gettingUnitContext}
            />
        );
        const users = (
            <UsersLayout
                users={this.props.icons}
                currentUnit={this.props.currentUnit}
            />
        );

        return (
            <DocumentLayout
                loading={this.props.loading}
                document={doc}
                ancestors={ancestors}
                users={users}
                timeline={timeline}
            />
        );
    }
}

export default Document;
