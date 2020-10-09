import React from "react";
import styled from "styled-components";

import { splitAtLinks, parseLinks } from "../utils/parseLinks";

import LinkIcon from "./LinkIcon";
import UnitLayout from "./UnitLayout";

const Unit = (props) => {
    const links = parseLinks(props.pith);
    const splitPith = splitAtLinks(props.pith);

    const content = [];
    for (const i in splitPith) {
        content.push(
            <span
                dangerouslySetInnerHTML={{ __html: splitPith[i] }}
                key={`content-${props.id}-${i}`}
            />
        );
        if (links[i]) {
            content.push(
                <LinkIcon
                    forward
                    referenceNum={parseInt(i) + 1}
                    key={`ref-${props.id}-${i}`}
                />
            );
        }
    }
    return <UnitLayout {...props} content={content} />;
};

export default Unit;
