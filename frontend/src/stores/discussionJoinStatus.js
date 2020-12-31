import { createDerivedSocketStore } from "./createDerivedSocketStore";

export const discussionJoinStatus = createDerivedSocketStore(
	{
		initialize: (caller, discussionId) => {
			caller((socket, set) => {
				console.log(
					"checking is valid with id ",
					discussionId,
					" and socket ",
					socket
				);
				set("yeh");
			});
		},
	},
	"nah"
);
