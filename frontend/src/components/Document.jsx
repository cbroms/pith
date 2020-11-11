import React from "react";

import {
    handleDrag,
    handleEnter,
    handleDelete,
    handleEdit,
} from "../utils/documentModifiers";

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
        };

        this.getStore = this.getStore.bind(this);
        this.getStoreCopy = this.getStoreCopy.bind(this);

        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);

        this.onUnitDelete = this.onUnitDelete.bind(this);
        this.onUnitEnter = this.onUnitEnter.bind(this);
        this.onUnitEdit = this.onUnitEdit.bind(this);

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

    onUnitDelete(isEmpty, content, position) {
        const store = this.getStoreCopy();
        const [focused, newStore] = handleDelete(
            store,
            isEmpty,
            content,
            position
        );
        if (newStore !== null) {
            this.setState({
                focused: focused,
                tempUnitCopy: newStore,
            });
        }
    }

    onUnitEnter(caretPos, content, position) {
        const store = this.getStoreCopy();
        const [newContent, focused, newStore] = handleEnter(
            store,
            caretPos,
            content,
            position
        );
        if (newStore !== null) {
            this.setState({
                focused: focused,
                tempUnitCopy: newStore,
            });
        }
        return newContent;
    }

    onUnitEdit(content, position) {
        const store = this.getStoreCopy();
        const newStore = handleEdit(store, content, position);
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

        // if (newDoc !== null) {
        //     this.setState({
        //         dragged: null,
        //         dragTarget: null,
        //         documentCopy: newDoc,
        //     });
        // }
    }

    getDragInfo(child, grandchild) {
        const over =
            this.state.dragTarget?.child === child &&
            this.state.dragTarget?.grandchild === grandchild;

        const overAsChild = over && this.state.dragTarget?.asChild;
        const overAtEnd = over && this.state.dragTarget?.atEnd;
        return [over, overAsChild, overAtEnd];
    }

    handleDragStart(e, childPosition, grandchildPosition) {
        this.setState({
            dragged: {
                child: childPosition,
                grandchild: grandchildPosition,
            },
        });
    }

    handleDragEnter(e, childPosition, grandchildPosition, asChild, atEnd) {
        this.setState({
            dragTarget: {
                child: childPosition,
                grandchild: grandchildPosition,
                asChild: asChild,
                atEnd: atEnd,
            },
        });
    }

    render() {
        // create a unit for a given location
        const createUnit = (pith, id, position) => {
            return (
                <Unit
                    editable
                    unitEnter={(pos, content) =>
                        this.onUnitEnter(pos, content, position)
                    }
                    unitDelete={(isEmpty, content) =>
                        this.onUnitDelete(isEmpty, content, position)
                    }
                    unitEdit={(content) => {
                        this.onUnitEdit(content, position);
                    }}
                    onFocus={() => this.setState({ focused: id })}
                    onBlur={() => this.setState({ focused: null })}
                    focused={this.state.focused === id}
                    placeholder={"type a pith..."}
                    pith={pith}
                    id={id}
                    inline
                />
            );
        };

        const createSection = (content, id, position, isLast, pith, level) => {
            const [over, asChild, atEnd] = this.getDragInfo(
                position.child,
                position.grandchild
            );

            return (
                <DocumentSectionLayout
                    draggable={this.state.focused !== id}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={(e) =>
                        this.handleDragStart(
                            e,
                            position.child,
                            position.grandchild
                        )
                    }
                    onDragEnter={(e, asChild, atEnd) =>
                        this.handleDragEnter(
                            e,
                            position.child,
                            position.grandchild,
                            asChild,
                            atEnd
                        )
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
                        const position = {
                            child: childIndex,
                            grandchild: grandchildIndex,
                            parentId: childId,
                            id: grandchildId,
                        };
                        return createSection(
                            null,
                            grandchildId,
                            position,
                            grandchildIndex === child.children.length - 1,
                            createUnit(grandchild.pith, grandchildId, position),
                            3
                        );
                    }
                );

                // create the child section
                const position = {
                    child: childIndex,
                    grandchild: null,
                    parentId: this.props.currentUnit,
                    id: childId,
                };
                return createSection(
                    grandchildren,
                    childId,
                    position,
                    childIndex ===
                        store[this.props.currentUnit].children.length - 1,
                    createUnit(child.pith, childId, position),
                    2
                );
            }
        );
        const pithUnit = createUnit(
            store[this.props.currentUnit].pith,
            this.props.currentUnit,
            {
                child: null,
                grandchild: null,
                id: this.props.currentUnit,
                parentId: null,
            }
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

        const timeline = <TimelineLayout pages={this.props.timeline} />;
        const ancestors = <AncestorsLayout ancestors={this.props.ancestors} />;
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
