import React from "react";
import ReactDOMServer from "react-dom/server";

import { splitAtLinks, parseLinks } from "../utils/parseLinks";

import LinkIcon from "./LinkIcon";
import TextEditor from "./TextEditor";

import TooltipLayout from "./TooltipLayout";
import UnitLayout from "./UnitLayout";

const Unit = (props) => {
    const links = parseLinks(props.pith);
    const splitPith = splitAtLinks(props.pith);

    let content = [];

    if (props.charLimited) {
        // in the case that we want a short preview of the pith, reconstruct it and
        // replace links with • character
        const cleanPith = splitPith.reduce((allParts, part, i) => {
            return allParts + part + (links[i] ? " • " : " ");
        }, "");

        content = [
            <span
                dangerouslySetInnerHTML={{
                    __html:
                        cleanPith.length > 140
                            ? cleanPith.substring(0, 140) + "..."
                            : cleanPith,
                }}
                key={`ref-${props.id}`}
            />,
        ];
    } else {
        // construct the pith parts with icons where links are
        for (const i in splitPith) {
            content.push(
                <span
                    dangerouslySetInnerHTML={{ __html: splitPith[i] }}
                    key={`content-${props.id}-${i}`}
                />
            );
            if (links[i]) {
                content.push(
                    <span key={`ref-${props.id}-${i}`}>
                        <LinkIcon
                            onMouseOver={() =>
                                props.chat
                                    ? props.linkHovered(parseInt(i) + 1)
                                    : null
                            }
                            onMouseOut={() =>
                                props.chat ? props.linkUnhovered() : null
                            }
                            data-tip
                            data-for={`ref-${props.id}-${i}`}
                            forward
                            referenceNum={props.chat ? parseInt(i) + 1 : null}
                        />
                        {!props.chat ? (
                            <TooltipLayout id={`ref-${props.id}-${i}`}>
                                <span> Hi </span>
                            </TooltipLayout>
                        ) : null}
                    </span>
                );
            }
        }
        if (props.editable) {
            // if the unit is editable, we need to feed the content to the TextEditor
            // component. it requires that we first render the component to a string of
            // html, then pass that to the TextEditor component
            const contentStr = ReactDOMServer.renderToString(content);
            content = (
                <TextEditor
                    showButton={props.showButton}
                    content={contentStr}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                />
            );
        }
    }

    return <UnitLayout {...props} content={content} />;
};

export default Unit;
