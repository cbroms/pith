import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
import { unpackChatMeta, unpackDocMeta } from "./utils";

import {
  CREATE_POST,
  CREATE_POST_FULFILLED,
  CREATED_POST,
} from "./types";

const createPost = (pith) => {
	return (dispatch) => {
		const data = {
			pith: pith,
		};

    // report to UI the attempt
		dispatch({
			type: CREATE_POST,
      payload: {
        pith: pith
      }
		});
    // backend acknowledged we sent request
		socket.emit("post", data, (res) => {
			dispatch({
				type: CREATE_POST_FULFILLED,
			});
		});
	};
};

const subscribeChat = () => {
    return (dispatch) => {
      socket.on("created_post", (res) => {
        const chatMeta = unpackChatMeta(res.chat_meta);
        const docMeta = unpackDocMeta(res.doc_meta);
        dispatch({
          type: CREATED_POST,
          payload: {
            unitId: res.unit_id,
            chatMapAdd: chatMeta,
            docMapAdd: docMeta,     
          }
        })
      })
   }
}

export {
  createPost,
};
