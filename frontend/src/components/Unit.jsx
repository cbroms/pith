import React, { useState } from "react";

import { splitAtLinks, parseLinks } from "../utils/parseLinks";

import LinkIcon from "./LinkIcon";
import TextEditor from "./TextEditor";

import TooltipLayout from "./TooltipLayout";
import UnitLayout from "./UnitLayout";

const Unit = (props) => {
    let pith = props.pith;

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
                                <span>
                                    {" "}
                                    A Memex is a machine introduced in Vannevar
                                    Bush's essay <em>As We May Think</em>.{" "}
                                </span>
                            </TooltipLayout>
                        ) : null}
                    </span>
                );
            }
        }
        if (props.editable) {
            content = (
                <TextEditor
                    showRenderDisplay={pith.length > 0}
                    unitEnter={props.unitEnter}
                    unitDelete={props.unitDelete}
                    showButton={props.showButton}
                    renderedContent={content} // pass the rendered version of the unit (with link icons)
                    content={pith}
                    isEmpty={pith.length === 0}
                    onFocus={props.onFocus}
                    onBlur={(temp) => {
                        props.unitEdit(temp);
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
