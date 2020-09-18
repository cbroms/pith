import React from "react";
import moment from "moment";

import "./style/Post.css";

function Post(props) {
	const date = moment(props.time);

	const formattedDate = date.calendar({
		sameDay: "[Today at] h:mm A",
		lastDay: "[Yesterday at] h:mm A",
		lastWeek: "dddd [at] h:mm A",
		sameElse: "M/D/YY [at] h:mm A",
	});

	return (
		<div
			className={`post ${
				props.heightLimited ? "post-height-limited" : ""
			}`}
			style={props.style}
		>
			<div className="post-header">
				<h4 className="post-title">{props.author}</h4>
				<h4 className="post-subtitle">{formattedDate}</h4>
			</div>
			{props.children}
		</div>
	);
}

export default Post;
