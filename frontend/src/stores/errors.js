export const errors = {
	SERVER_ERR : -1,
	BAD_REQUEST : -2,
	DNE_BOARD : -3,
	DNE_DISC : -4,
	DNE_UNIT : -5,
	DNE_LINK : -6,
	DNE_USER : -7,
	EXISTS_NAME : -8,
	NOT_CHAT : -9,
	NOT_BOARD : -10,
}

export const errorHandler = ( reject, error, meta ) => {
	switch (error) {
		case errors.SERVER_ERR : {
			reject("Server error.");
		}
		case errors.BAD_REQUEST : {
			reject("Malformed request.");
		}
		case errors.DNE_BOARD : {
			reject(`Board ${meta.board_id} does not exist.`);
		}
		case errors.DNE_DISC : {
			reject(`Discussion ${meta.discussion_id} does not exist.`);
		}
		case errors.DNE_UNIT : {
			reject(`Unit ${meta.unit_id} does not exist.`);
		}
		case errors.DNE_LINK : {
			reject(`Link ${meta.link_id} does not exist.`);
		}
		case errors.DNE_USER : {
			reject(`User ${meta.user_id} does not exist.`);
		}
		case errors.EXISTS_NAME : {
			reject(`Nickname ${meta.nickname} unavailable.`);
		}
		case errors.NOT_CHAT : {
			reject(`Unit ${meta.unit_id} is not of type chat.`);
		}
		case errors.NOT_BOARD : {
			reject(`Unit ${meta.unit_id} is not of type board.`);
		}
	}
}
