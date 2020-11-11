import React from "react";
import styled from "styled-components";
import * as dayjs from "dayjs";
import * as duration from "dayjs/plugin/duration";
import * as utc from "dayjs/plugin/utc";
import * as relativeTime from "dayjs/plugin/relativeTime";

import TooltipLayout from "./TooltipLayout";
import UnitContext from "./UnitContext";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);

const StyledContainer = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    overflow: hidden;
`;

const StyledTooltipTime = styled.div`
    font-family: ${(props) => props.theme.sans};
    color: ${(props) => props.theme.shade2};
    font-size: ${(props) => props.theme.smallFont};
`;

const StyledUnitRepresentation = styled.div`
    box-sizing: border-box;
    width: 10px;
    height: calc(${(props) => props.scaledDuration}% - 10px);
    background-color:  ${(props) => props.theme.shade2};
    margin: 5px;
    //border-right: 1px solid ${(props) => props.theme.shade2};
    cursor: pointer;

    @media (max-width: 768px) {
        height: 20px;
        margin: 5px 3px;
        display: inline-block;
        width: calc(${(props) => props.scaledDuration}% - 10px);
    }

    :hover {
        //border-right: 1px solid ${(props) => props.theme.shade3};
        background-color: ${(props) => props.theme.shade3};
    }
`;

const TimelineLayout = (props) => {
    //  const [discussionActive, setDiscussionActive] = useState(true);
    const pages = props.pages.slice(
        props.pages.length - 26,
        props.pages.length - 1
    );
    const calculatedPages = pages.map((page) => {
        const startTime = dayjs(page.startTime).utc();
        const endTime = dayjs(page.endTime).utc();

        // calcuate the total amount of time the page was active
        const timeSpent = dayjs.duration(endTime.diff(startTime));
        let timeActive = timeSpent.asSeconds();
        timeActive = timeActive > 1800 ? 1800 : timeActive;
        timeActive = timeActive < 60 ? 60 : timeActive;

        // calcuate the time from now the page was active
        const timeFromNow = dayjs
            .duration(dayjs().diff(endTime.local()))
            .humanize();

        return {
            span: timeActive,
            diff: `${timeFromNow} ago for ${timeSpent.humanize()}`,
            pith: page.pith,
        };
    });

    const total = Object.values(calculatedPages).reduce(
        (sum, { span }) => sum + span,
        0
    );

    const unitSections = calculatedPages.map((page, i) => {
        return (
            <span
                key={`${pages[i].unitId}-${page.span}-${i}`}
                onClick={() => props.openUnit(pages[i].unitId)}
            >
                <StyledUnitRepresentation
                    data-tip
                    data-for={`${pages[i].unitId}-${page.span}`}
                    scaledDuration={(page.span / total) * 100}
                />
                <TooltipLayout
                    id={`${pages[i].unitId}-${page.span}`}
                    getContent={() => (
                        <span>
                            <StyledTooltipTime>{page.diff}</StyledTooltipTime>
                            <UnitContext
                                id={pages[i].unitId}
                                units={props.units}
                                getUnitContext={props.getUnitContext}
                                gettingUnitContext={props.gettingUnitContext}
                            />
                        </span>
                    )}
                ></TooltipLayout>
            </span>
        );
    });

    return <StyledContainer>{unitSections}</StyledContainer>;
};

export default TimelineLayout;
