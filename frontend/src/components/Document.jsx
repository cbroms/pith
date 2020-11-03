import React from "react";

import {
    handleDrag,
    handleEnter,
    handleDelete,
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

    onUnitDelete(content, position) {
        const newDoc = handleDelete(
            [...this.state.documentCopy],
            content,
            position
        );
        if (newDoc !== null) {
            this.setState({
                documentCopy: newDoc,
            });
        }
    }

    onUnitEnter(caretPos, content, position) {
        const [newContent, focused, newDoc] = handleEnter(
            [...this.state.documentCopy],
            caretPos,
            content,
            position
        );
        if (newDoc !== null) {
            this.setState({
                focused: focused,
                documentCopy: newDoc,
            });
        }
        return newContent;
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
        const newDoc = handleDrag(
            [...this.state.documentCopy],
            this.state.dragged,
            this.state.dragTarget
        );

        if (newDoc !== null) {
            this.setState({
                dragged: null,
                dragTarget: null,
                documentCopy: newDoc,
            });
        }
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
                    unitDelete={(content) =>
                        this.onUnitDelete(content, position)
                    }
                    onFocus={() => this.setState({ focused: id })}
                    onBlur={() => this.setState({ focused: null })}
                    focused={this.state.focused === id}
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
                        grandchild.unit_id,
                        { child: childIndex, grandchild: grandchildIndex }
                    );
                    return createSection(
                        null,
                        grandchild.unit_id,
                        { child: childIndex, grandchild: grandchildIndex },
                        grandchildIndex === child.children.length - 1,
                        pith,
                        3
                    );
                }
            );
            const pith = createUnit(child.pith, child.unit_id, {
                child: childIndex,
                grandchild: null,
            });

            return createSection(
                grandchildren,
                child.unit_id,
                { child: childIndex, grandchild: null },
                childIndex === this.state.documentCopy.length - 1,
                pith,
                2
            );
        });
        const pithUnit = createUnit(
            this.props.view.pith,
            this.props.view.unit_id,
            { child: null, grandchild: null }
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
