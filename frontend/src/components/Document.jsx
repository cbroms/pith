import React from "react";

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
            documentCopy: props.view.children,
            dragged: null,
            dragTarget: null,
            focused: null,
        };

        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);

        this.onUnitDelete = this.onUnitDelete.bind(this);
        this.onUnitEnter = this.onUnitEnter.bind(this);

        this.getDragInfo = this.getDragInfo.bind(this);
    }

    onUnitDelete(content, id) {
        console.log(content, id);
    }

    onUnitEnter(position, enter, id) {
        console.log(position, enter, id);
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

    handleDragEnd(e) {
        const newDocument = [...this.state.documentCopy];
        const dragged = this.state.dragged;
        const dragTarget = this.state.dragTarget;

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
                          ...newDocument[dragged.child].children[
                              dragged.grandchild
                          ],
                      }
                    : { ...newDocument[dragged.child] };

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

                newDocument[dragTarget.child].children.splice(
                    newGrandchildPos,
                    0,
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

                newDocument.splice(newChildPos, 0, draggingItemContent);
            } else if (dragTarget.asChild && dragTarget.grandchild !== null) {
                // do nothing, this is making the unit a child of a grandchild so it is
                // outside of the render scope
            } else {
                // make a grandchild
                const index = dragTarget.atEnd
                    ? newDocument[dragTarget.child].children.length - 1
                    : 0;

                newDocument[dragTarget.child].children.splice(
                    index,
                    0,
                    draggingItemContent
                );
            }

            // remove the item from its previous position
            if (dragged.grandchild !== null) {
                console.log(
                    "removing",
                    oldGrandchildIndex,
                    "from",
                    oldChildIndex
                );
                newDocument[oldChildIndex].children.splice(
                    oldGrandchildIndex,
                    1
                );
            } else {
                newDocument.splice(oldChildIndex, 1);
            }

            this.setState({
                dragged: null,
                dragTarget: null,
                documentCopy: newDocument,
            });
        }
    }

    render() {
        // create a unit for a given location
        const createUnit = (pith, id) => {
            return (
                <Unit
                    editable
                    unitEnter={(pos, content) =>
                        this.onUnitEnter(pos, content, id)
                    }
                    unitDelete={(content) => this.onUnitDelete(content, id)}
                    onFocus={() => this.setState({ focused: id })}
                    onBlur={() => this.setState({ focused: null })}
                    pith={pith}
                    id={id}
                    inline
                />
            );
        };

        const createSection = (
            content,
            id,
            childIndex,
            grandchildIndex,
            isLast,
            pith,
            level
        ) => {
            const [over, asChild, atEnd] = this.getDragInfo(
                childIndex,
                grandchildIndex
            );

            return (
                <DocumentSectionLayout
                    draggable={this.state.focused !== id}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={(e) =>
                        this.handleDragStart(e, childIndex, grandchildIndex)
                    }
                    onDragEnter={(e, asChild, atEnd) =>
                        this.handleDragEnter(
                            e,
                            childIndex,
                            grandchildIndex,
                            asChild,
                            atEnd
                        )
                    }
                    onDragOver={(e) => e.preventDefault()}
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

        // create the sections in the doc with children + grandchildren
        const sections = this.state.documentCopy.map((child, childIndex) => {
            const grandchildren = child.children.map(
                (grandchild, grandchildIndex) => {
                    const pith = createUnit(
                        grandchild.pith,
                        grandchild.unit_id
                    );
                    return createSection(
                        null,
                        grandchild.unit_id,
                        childIndex,
                        grandchildIndex,
                        grandchildIndex === child.children.length - 1,
                        pith,
                        3
                    );
                }
            );
            const pith = createUnit(child.pith, child.unit_id);

            return createSection(
                grandchildren,
                child.unit_id,
                childIndex,
                null,
                childIndex === this.state.documentCopy.length - 1,
                pith,
                2
            );
        });
        const pithUnit = createUnit(
            this.props.view.pith,
            this.props.view.unit_id
        );
        const doc = (
            <DocumentSectionLayout
                focused={this.state.focused === this.props.view.unit_id}
                level={1}
                pith={pithUnit}
                onDragEnter={() => null}
            >
                {sections}
            </DocumentSectionLayout>
        );

        const timeline = <TimelineLayout pages={this.props.timeline} />;
        const ancestors = (
            <AncestorsLayout ancestors={this.props.view.ancestors} />
        );
        const users = <UsersLayout users={this.props.users} />;

        return (
            <DocumentLayout
                document={doc}
                ancestors={ancestors}
                users={users}
                timeline={timeline}
            />
        );
    }
}

export default Document;
