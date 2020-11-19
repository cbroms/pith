import { GENERIC_ERROR, SYSTEM_ERROR } from "../utils/errors";

const getStatus = (response, dispatch, errorMap) => {
  let statusCode = null;
  if (Object.keys(response).includes("error")) {
    const errorStamp = response.error;
    console.error("error", errorStamp);
    for (const key in errorMap) {
      if (errorStamp === parseInt(key)) {
        statusCode = errorMap[key];
        break;
      }
    }
    if (statusCode === null) {
      statusCode = GENERIC_ERROR;
      dispatch({
        type: SYSTEM_ERROR,
      });
    }
  }
  return statusCode;
};

const unpackCursors = (cursorsArr = []) => {
  const cursors = {};
  for (const entry of cursorsArr) {
    cursors[entry.user_id] = {
      userId: entry.user_id,
      nickname: entry.nickname,
      unitId: entry.cursor.unit_id,
    };
  }
  return cursors;
};

const unpackChildren = (children = []) => {
  const childDoc = [];
  for (const entry of children) {
    const grandChildren = [];
    for (const g of entry.children) {
      grandChildren.push(g.unit_id);
    }
    childDoc.push({
      unitId: entry.unit_id,
      children: grandChildren,
    });
  }
  return childDoc;
};

const unpackBacklinks = (backlinks = []) => {
  const backlinkDoc = [];
  for (const entry of backlinks) {
    const grandBacklinks = [];
    for (const g of entry.backlinks) {
      grandBacklinks.push(g.unit_id);
    }
    backlinkDoc.push({
      unitId: entry.unit_id,
      backlinks: grandBacklinks,
    });
  }
  return backlinkDoc;
};

const unpackTimelineEntry = (timeEntry = {}) => {
  return {
    unitId: timeEntry?.unit_id,
    startTime: timeEntry?.start_time,
    endTime: timeEntry?.end_time,
  };
};

const unpackTimeline = (timelineArr = []) => {
  const timeline = [];
  for (const entry of timelineArr) {
    timeline.push(unpackTimelineEntry(entry));
  }
  return timeline;
};

const unpackChatMeta = (chatMetaArr = []) => {
  const chatMeta = {};
  for (const unit of chatMetaArr) {
    chatMeta[unit.unit_id] = {
      pith: unit.pith,
      author: unit.author,
      createdAt: unit.created_at,
    };
  }
  return chatMeta;
};

const unpackDocMeta = (docMetaArr = []) => {
  const docMeta = {};
  for (const unit of docMetaArr) {
    docMeta[unit.unit_id] = {
      pith: unit.pith,
      hidden: unit.hidden,
      createdAt: unit.created_at,
      editLock: unit.edit_privilege,
      positionLock: unit.position_privilege,
      children: unit.children,
      backlinks: unit.backlinks,
    };
  }
  return docMeta;
};

const unpackContext = (contextObj = {}) => {
  const children = [];
  for (const entry in contextObj.children) {
    if (!entry.hidden) {
      children.push({
        unitId: entry.unit_id,
        pith: entry.pith,
      });
    }
  }
  const context = {
    pith: contextObj.pith,
    children: children,
  };
  return context;
};

export {
  getStatus,
  unpackCursors,
  unpackChildren,
  unpackBacklinks,
  unpackTimelineEntry,
  unpackTimeline,
  unpackContext,
  unpackChatMeta,
  unpackDocMeta,
};
