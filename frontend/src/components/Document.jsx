import React from "react";

import Unit from "./Unit";
import AncestorsLayout from "./AncestorsLayout";
import DocumentLayout from "./DocumentLayout";
import DocumentSectionLayout from "./DocumentSectionLayout";

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
    const pithUnit = <Unit big={true} pith={props.view.pith} />;
    const doc = (
        <DocumentSectionLayout level={1} pith={pithUnit}>
            {sections}
        </DocumentSectionLayout>
    );

    const ancestors = <AncestorsLayout ancestors={props.view.ancestors} />;

    return <DocumentLayout document={doc} ancestors={ancestors} />;
};

export default Document;
