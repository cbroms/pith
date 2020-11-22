import React, { useState } from "react";

import { addHighlight } from "../utils/pithModifiers";
import { splitAtLinks, parseLinks } from "../utils/parseLinks";

import LinkIcon from "./LinkIcon";
import TextEditor from "./TextEditor";

import TooltipLayout from "./TooltipLayout";
import UnitLayout from "./UnitLayout";

const Unit = (props) => {
    let pith = props.pith;

    const modPith = props.highlight
        ? addHighlight(pith, props.highlight)
        : pith;
    const links = parseLinks(modPith);
    const splitPith = splitAtLinks(modPith);

    let content = [];

    if (props.charLimited || props.transcluded) {
        // in the case that we want a short preview of the pith, reconstruct it and
        // replace links with • character
        const cleanPith = splitPith.reduce((allParts, part, i) => {
            return allParts + part + (links[i] ? " • " : " ");
        }, "");

        content = (
            <span
                dangerouslySetInnerHTML={{
                    __html:
                        props.charLimited && cleanPith.length > 140
                            ? cleanPith.substring(0, 137) + "..."
                            : cleanPith,
                }}
            />
        );
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
                                    ? props.linkHovered(
                                          parseInt(i) +
                                              1 +
                                              props.transclusionStartingRef
                                      )
                                    : null
                            }
                            onMouseOut={() =>
                                props.chat ? props.linkUnhovered() : null
                            }
                            data-tip
                            data-for={`ref-${props.id}-${i}`}
                            forward
                            referenceNum={
                                props.chat
                                    ? parseInt(i) +
                                      1 +
                                      props.transclusionStartingRef
                                    : null
                            }
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
                    unitTab={props.unitTab}
                    showButton={props.showButton}
                    renderedContent={content} // pass the rendered version of the unit (with link icons)
                    content={pith}
                    isEmpty={pith.length === 0}
                    unitFocus={props.unitFocus}
                    unitEdit={props.unitEdit}
                    unitBlur={props.unitBlur}
                    focused={props.focused}
                    focusedPosition={props.focusedPosition}
                    placeholder={props.placeholder}
                    openSearch={props.openSearch}
                    closeSearch={props.closeSearch}
                    setQuery={props.setQuery}
                />
            );
        }
    }

    return <UnitLayout {...props} content={content} />;
};

export default Unit;
