import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
    grid-template-columns: [ancestor] 40px [ancestor-end document] 1fr [document-end timeline] 40px [timeline-end];
    grid-template-rows: [participants] 40px [participants-end content] 1fr [content-end];
    display: grid;
    height: 100%;
    max-height: 100%;

    @media (max-width: 768px) {
        grid-template-columns: [ancestor] 40px [ancestor-end document] 1fr [document-end];
        grid-template-rows: [participants] 50px [participants-end content] 1fr [content-end timeline] 40px [timeline-end];
    }
`;

const StyledAncestorList = styled.div`
    grid-column-start: ancestor;
    grid-column-end: ancestor-end;
    grid-row-start: content;
    grid-row-end: content-end;
    // background-color: IndianRed;
`;

const StyledParticipantList = styled.div`
    grid-column-start: ancestor;
    grid-column-end: timeline-end;
    grid-row-start: participants;
    grid-row-end: participants-end;
    // background-color: Khaki;
    justify-self: end;

    @media (max-width: 768px) {
        grid-column-start: ancestor;
        grid-column-end: document-end;
    }
`;

const StyledTimeline = styled.div`
    grid-column-start: timeline;
    grid-column-end: timeline-end;
    grid-row-start: content;
    grid-row-end: content-end;
    justify-self: end;
    // background-color: Khaki;

    @media (max-width: 768px) {
        grid-column-start: ancestor;
        grid-column-end: document-end;
        grid-row-start: timeline;
        grid-row-end: timeline-end;
    }
`;

const StyledDocument = styled.div`
    grid-column-start: document;
    grid-column-end: document-end;
    grid-row-start: content;
    grid-row-end: content-end;
    height: 100%;
    overflow-y: scroll;
    // background-color: SkyBlue;
`;

const StyledLoadingContainer = styled(StyledDocument)`
    font-style: italic;
    color: ${(props) => props.theme.shade2};
`;

const DocumentLayout = (props) => {
    return (
        <span>
            {props.loading ? (
                <StyledContainer>
                    <StyledLoadingContainer>
                        Loading document...
                    </StyledLoadingContainer>
                </StyledContainer>
            ) : (
                <StyledContainer>
                    <StyledTimeline>{props.timeline}</StyledTimeline>
                    <StyledParticipantList>{props.users}</StyledParticipantList>
                    <StyledDocument>{props.document}</StyledDocument>
                    <StyledAncestorList>{props.ancestors}</StyledAncestorList>
                </StyledContainer>
            )}
        </span>
    );
};

export default DocumentLayout;
