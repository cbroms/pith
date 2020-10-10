import React, { useState } from "react";
import styled from "styled-components";
import * as dayjs from "dayjs";
import * as duration from "dayjs/plugin/duration";
import * as utc from "dayjs/plugin/utc";

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

const StyledUnitRepresentation = styled.div`
    box-sizing: border-box;
    width: 20px;
    height: calc(${(props) => props.scaledDuration}% - 10px);
    background-color: ${(props) => props.theme.backgroundColor2};
    margin: 5px;
    border: 1px solid ${(props) => props.theme.textColor3};

    @media (max-width: 768px) {
        height: 20px;
        margin: 5px 3px;
        display: inline-block;
        width: calc(${(props) => props.scaledDuration}% - 10px);
    }
`;

const TimelineLayout = (props) => {
    //  const [discussionActive, setDiscussionActive] = useState(true);

    const times = props.pages.map((page) => {
        const startTime = dayjs(page.start_time).utc();
        const endTime = dayjs(page.end_time).utc();

        let timeDiff = dayjs.duration(endTime.diff(startTime)).asSeconds();
        timeDiff = timeDiff > 1800 ? 1800 : timeDiff;
        timeDiff = timeDiff < 60 ? 60 : timeDiff;
        return timeDiff; //Math.log(timeDiff);
    });

    const total = times.reduce((sum, time) => sum + time);

    const unitSections = times.map((time, i) => {
        return (
            <StyledUnitRepresentation
                scaledDuration={(time / total) * 100}
                key={`${props.pages[i].unit_id}-${time}`}
            />
        );
    });

    return <StyledContainer>{unitSections}</StyledContainer>;
};

export default TimelineLayout;
