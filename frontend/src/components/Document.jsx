import React, { useRef, useState, useEffect } from "react";

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
        };

        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
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
        const sections = this.state.documentCopy.map((child, childIndex) => {
            const grandchildren = child.children.map(
                (grandchild, grandchildIndex) => {
                    const pithUnit = (
                        <Unit
                            pith={grandchild.pith}
                            id={grandchild.unit_id}
                            inline
                        />
                    );

                    const over =
                        this.state.dragTarget?.child === childIndex &&
                        this.state.dragTarget?.grandchild === grandchildIndex;

                    const overAsChild = over && this.state.dragTarget?.asChild;
                    const overAtEnd = over && this.state.dragTarget?.atEnd;

                    return (
                        <DocumentSectionLayout
                            draggable
                            onDragEnd={this.handleDragEnd}
                            onDragStart={(e) =>
                                this.handleDragStart(
                                    e,
                                    childIndex,
                                    grandchildIndex
                                )
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
                            overAsChild={overAsChild}
                            overAtEnd={overAtEnd}
                            last={grandchildIndex === child.children.length - 1}
                            level={3}
                            key={grandchild.unit_id}
                            pith={pithUnit}
                        />
                    );
                }
            );
            const pithUnit = (
                <Unit pith={child.pith} id={child.unit_id} inline />
            );
            const over =
                this.state.dragTarget?.child === childIndex &&
                this.state.dragTarget?.grandchild === null;

            const overAsChild = over && this.state.dragTarget?.asChild;
            const overAtEnd = over && this.state.dragTarget?.atEnd;
            return (
                <DocumentSectionLayout
                    draggable
                    onDragOver={(e) => e.preventDefault()}
                    onDragStart={(e) =>
                        this.handleDragStart(e, childIndex, null)
                    }
                    onDragEnter={(e, asChild, atEnd) =>
                        this.handleDragEnter(
                            e,
                            childIndex,
                            null,
                            asChild,
                            atEnd
                        )
                    }
                    onDragEnd={this.handleDragEnd}
                    over={over}
                    overAsChild={overAsChild}
                    overAtEnd={overAtEnd}
                    last={childIndex === this.state.documentCopy.length - 1}
                    key={child.unit_id}
                    level={2}
                    pith={pithUnit}
                >
                    {grandchildren}
                </DocumentSectionLayout>
            );
        });
        const pithUnit = (
            <Unit
                big={true}
                pith={this.props.view.pith}
                id={this.props.view.unit_id}
                inline
            />
        );
        const doc = (
            <DocumentSectionLayout
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
