import React from "react";

import Unit from "./Unit";
import AncestorsLayout from "./AncestorsLayout";
import DocumentLayout from "./DocumentLayout";
import TimelineLayout from "./TimelineLayout";
import DocumentSectionLayout from "./DocumentSectionLayout";
import UsersLayout from "./UsersLayout";

const Document = (props) => {
    const sections = props.view.children.map((child) => {
        const grandchildren = child.children.map((grandchild) => {
            const pithUnit = <Unit pith={grandchild.pith} inline />;
            return (
                <DocumentSectionLayout
                    level={3}
                    key={grandchild.unit_id}
                    pith={pithUnit}
                />
            );
        });
        const pithUnit = <Unit pith={child.pith} inline />;
        return (
            <DocumentSectionLayout
                key={child.unit_id}
                level={2}
                pith={pithUnit}
            >
                {grandchildren}
            </DocumentSectionLayout>
        );
    });
    const pithUnit = <Unit big={true} pith={props.view.pith} inline />;
    const doc = (
        <DocumentSectionLayout level={1} pith={pithUnit}>
            {sections}
        </DocumentSectionLayout>
    );

    const timeline = <TimelineLayout pages={props.timeline} />;
    const ancestors = <AncestorsLayout ancestors={props.view.ancestors} />;
    const users = <UsersLayout users={props.users} />;

    return (
        <DocumentLayout
            document={doc}
            ancestors={ancestors}
            users={users}
            timeline={timeline}
        />
    );
};

export default Document;
