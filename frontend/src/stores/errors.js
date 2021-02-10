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

export const errorHandler = (error, meta, update) => {
	switch (error) {
		case errors.SERVER_ERR : {
            update((state) => {
                return {...state, serverError: true}
            })
			return "Server error.";
		}
		case errors.BAD_REQUEST : {
			return "Malformed request.";
		}
		case errors.DNE_BOARD : {
			return `Board ${meta.board_id} does not exist.`;
		}
		case errors.DNE_DISC : {
			return `Discussion ${meta.discussion_id} does not exist.`;
		}
		case errors.DNE_UNIT : {
			return `Unit ${meta.unit_id} does not exist.`;
		}
		case errors.DNE_LINK : {
			return `Link ${meta.link_id} does not exist.`;
		}
		case errors.DNE_USER : {
			return `User ${meta.user_id} does not exist.`;
		}
		case errors.EXISTS_NAME : {
			return `Nickname ${meta.nickname} unavailable.`;
		}
		case errors.NOT_CHAT : {
			return `Unit ${meta.unit_id} is not of type chat.`;
		}
		case errors.NOT_BOARD : {
			return `Unit ${meta.unit_id} is not of type board.`;
		}
	}
}
