
const unpackChatMeta = (chatMetaArr) => {
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

const unpackDocMeta = (docMetaArr) => {
    const docMeta = {};
    for (const unit of docMetaArr) {
      docMeta[unit.unit_id] = {
        pith: unit.pith,
        hidden: unit.hidden,
        createdAt: unit.created_at,
      };
    }
  return docMeta;
};

export { unpackChatMeta, unpackDocMeta }
