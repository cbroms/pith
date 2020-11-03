import React, { useState } from "react";
import ReactDOMServer from "react-dom/server";

import { splitAtLinks, parseLinks } from "../utils/parseLinks";

import LinkIcon from "./LinkIcon";
import TextEditor from "./TextEditor";

import TooltipLayout from "./TooltipLayout";
import UnitLayout from "./UnitLayout";

const Unit = (props) => {
    const [tempContent, setTempContent] = useState(null);

    let pith = props.pith;
    if (tempContent !== null && tempContent !== pith) pith = tempContent;

    const links = parseLinks(pith);
    const splitPith = splitAtLinks(pith);

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
                    unitEnter={props.unitEnter}
                    unitDelete={props.unitDelete}
                    showButton={props.showButton}
                    renderedContent={contentStr}
                    content={props.pith}
                    onFocus={props.onFocus}
                    // TODO: reset the temp when we get a prop refresh. We only want
                    // this to happen when there's an update from the server, though,
                    // so there probably needs to be some fancy logic somewhere for that.
                    onBlur={(temp) => {
                        setTempContent(temp);
                        props.onBlur();
                    }}
                    focused={props.focused}
                    placeholder={props.placeholder}
                />
            );
        }
    }

    return <UnitLayout {...props} content={content} />;
};

export default Unit;
