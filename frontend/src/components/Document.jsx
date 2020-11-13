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
            tempUnitCopy: {}, // a temporary copy of the unit store while we're editing
            dragged: null,
            dragTarget: null,
            focused: null,
            focusedPosition: null,
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

        this.getDragInfo = this.getDragInfo.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        // wipe any local updates
        // if (this.state.documentCopy.length > 0) {
        //     this.setState({ documentCopy: [] });
        // }
    }

    // return whichever store we're using (locally modified or global from props)
    getStore() {
        if (Object.keys(this.state.tempUnitCopy).length === 0)
            return this.props.units;
        return this.state.tempUnitCopy;
    }

    // get a copy of whichever store we're using,
    getStoreCopy() {
        const store = this.getStore();
        return { ...store };
    }

    onUnitDelete(isEmpty, content, id, pid) {
        const store = this.getStoreCopy();
        const [focused, focusedPosition, newStore] = handleDelete(
            store,
            isEmpty,
            content,
            id,
            pid
        );
        if (newStore !== null) {
            this.setState({
                focused: focused,
                focusedPosition: focusedPosition,
                tempUnitCopy: newStore,
            });
        }
    }

    onUnitTab(shifted, id, pid, ppid) {
        const store = this.getStoreCopy();
        const newStore = handleTab(store, shifted, id, pid, ppid);
        if (newStore !== null) {
            this.setState({
                tempUnitCopy: newStore,
            });
        }
    }

    onUnitEnter(caretPos, content, id, pid) {
        const store = this.getStoreCopy();
        const [newContent, focused, newStore] = handleEnter(
            store,
            caretPos,
            content,
            id,
            pid
        );
        if (newStore !== null) {
            this.setState({
                focused: focused,
                focusedPosition: 0,
                tempUnitCopy: newStore,
            });
        }
        return newContent;
    }

    onUnitEdit(content, id, pid) {
        const store = this.getStoreCopy();
        const newStore = handleEdit(store, content, id, pid);
        if (newStore !== null) {
            this.setState({
                tempUnitCopy: newStore,
            });
        }
    }

    handleDragEnd(e) {
        // TODO: change this
        const store = { ...this.props.units };

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
        const createUnit = (pith, id, pid, ppid) => {
            return (
                <Unit
                    editable
                    unitEnter={(pos, content) =>
                        this.onUnitEnter(pos, content, id, pid)
                    }
                    unitDelete={(isEmpty, content) =>
                        this.onUnitDelete(isEmpty, content, id, pid)
                    }
                    unitEdit={(content) => {
                        this.onUnitEdit(content, id, pid);
                    }}
                    unitTab={(shifted) =>
                        this.onUnitTab(shifted, id, pid, ppid)
                    }
                    onFocus={() => {
                        this.setState({
                            focused: id,
                            focusedPosition: getDecodedLengthOfPith(pith),
                        });
                    }}
                    onBlur={() => this.setState({ focused: null })}
                    focused={this.state.focused === id}
                    focusedPosition={
                        this.state.focused === id
                            ? this.state.focusedPosition
                            : null
                    }
                    placeholder={"type a pith..."}
                    pith={pith}
                    id={id}
                    inline
                />
            );
        };

        const createSection = (content, id, pid, isLast, pith, level) => {
            const [over, asChild, atEnd] = this.getDragInfo(id);

            return (
                <DocumentSectionLayout
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

        // create the sections in the doc with children + grandchildren
        const sections = store[this.props.currentUnit]?.children?.map(
            (childId, childIndex) => {
                const child = store[childId];

                // create the grandchild sections for each child
                const grandchildren = store[childId]?.children?.map(
                    (grandchildId, grandchildIndex) => {
                        const grandchild = store[grandchildId];
                        return createSection(
                            null,
                            grandchildId,
                            childId,
                            grandchildIndex === child.children.length - 1,
                            createUnit(
                                grandchild.pith,
                                grandchildId,
                                childId,
                                this.props.currentUnit
                            ),
                            3
                        );
                    }
                );

                // create the child section
                return createSection(
                    grandchildren,
                    childId,
                    this.props.currentUnit,
                    childIndex ===
                        store[this.props.currentUnit].children.length - 1,
                    createUnit(
                        child.pith,
                        childId,
                        this.props.currentUnit,
                        null
                    ),
                    2
                );
            }
        );
        const pithUnit = createUnit(
            store[this.props.currentUnit].pith,
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
                users={this.props.users}
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
