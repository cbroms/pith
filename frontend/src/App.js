import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./App.css";

// import LinkIcon from "./components/LinkIcon";
import Discussion from "./components/Discussion";
// import Discussion from "./components/Discussion";

const theme = {
	textColor1: "white",
	textColor2: "#afafaf",
	textColor3: "#636363",
	hoveredBackgroundColor: "grey",
	backgroundColor1: "#222222",
	backgroundColor2: "#383838",
	backgroundColor3: "#444444",
	smallBorder: "1px solid #afafaf",
	smallBorderActive: "1px solid white",
	largeBorder: "2px solid white",
	smallFont: "0.8rem",
	mediumFont: "1rem",
	largeFont: "1.25rem",
	extraLargeFont: "1.4rem",
	sans: "'Source Sans Pro', sans-serif",
	serif: "'Source Serif Pro', serif",
};

const postsDummy = ["2o3iupoweuqo", "2o32o467o3y364", "2o32o46sdaf7o3y364"];

const postUnits = {
	"2o3iupoweuqo": {
		created_at: "2020-10-06T02:28:52.000Z",
		author: "Christian",
		pith:
			"Project Xanadu was pretty interesting, we should include it in the list too.",
	},
	"2o32o467o3y364": {
		created_at: "2020-10-06T02:36:31.000Z",
		author: "Sam",
		pith:
			"We <em>might</em> be able to try out one of the old Xanadu prototypes.",
	},
	"2o32o46sdaf7o3y364": {
		created_at: "2020-10-06T04:41:45.000Z",
		author: "Jimmy",
		pith:
			"<cite>2o3iupoweuqo</cite> I went ahead and added Xanadu, and this <cite>2o32o467o3y364</cite> would be awesome. ",
	},
};

const documentDummy = {
	pith:
		"Project Xanadu was the first hypertext project, and aimed to link the world's information digitally",
	ancestors: [
		"28utwejf9pq348ut",
		"893yt9wyg9y3q43",
		"q3984tuqpwrugpu",
		"q3p4tu3gihfefw",
	],
	unit_id: "28utwejf9pq348ut",
	children: [
		{
			unit_id: "3498tyqe9ygq93g",
			pith:
				"Xanadu doesn't rely on the same paper metaphor that most digital publishing does today.",
			children: [
				{
					unit_id: "34utqpieorghpq34",
					pith:
						"Each document is composed of a series of transclusions to other documents.",
				},
				{
					unit_id: "1348qefioqph43uqgh",
					pith: "The links between documents are made visible.",
				},
			],
		},
		{
			unit_id: "3849t7093ygwe",
			pith:
				"Xanadu is often compared to Vannevar Bush's <em>Memex</em>, a fictional machine allowing a user to index and traverse a repository of information.",
			children: [],
		},
		{
			unit_id: "3948yu9qhrgweg",
			pith:
				"A number of working prototypes of the Xanadu technology exist today.",
			children: [],
		},
	],
};

const usersDummy = [
	{
		user_id: "a4tuqpirghiquehg",
		nickname: "Christian",
		cursor_position: { unit_id: "p2o438tuioweh", position: -1 },
	},
	{
		user_id: "38tyierhfqp9348",
		nickname: "Sydney",
		cursor_position: { unit_id: "p2o438tuioweh", position: -1 },
	},
];

const timelineDummy = [
	{
		unit_id: "2o32o467o3y364",
		start_time: "2020-10-06T02:28:52.000Z",
		end_time: "2020-10-08T02:28:52.000Z",
	}, // 2 days
	{
		unit_id: "3849t7093ygwe",
		start_time: "2020-10-06T02:27:52.000Z",
		end_time: "2020-10-06T02:29:52.000Z",
	}, // 2 min
	{
		unit_id: "2o32o467o3y364",
		start_time: "2020-10-08T02:28:45.000Z",
		end_time: "2020-10-08T02:29:00.000Z",
	}, // 45 sec
	{
		unit_id: "2o32o467o3y364",
		start_time: "2020-10-08T02:29:00.000Z",
		end_time: "2020-10-08T02:29:15.000Z",
	}, // 15 sec
	{
		unit_id: "2o32o467o3y364",
		start_time: "2020-10-08T02:29:00.000Z",
		end_time: "2020-10-08T02:29:01.000Z",
	}, // 15 sec
];

function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Discussion
					timeline={timelineDummy}
					content={postUnits}
					posts={postsDummy}
					document={documentDummy}
					users={usersDummy}
				/>
			</ThemeProvider>

			{/*<Router>
				<Switch>
					<Route
						exact
						path="/b/:boardID/d/:discussionID"
						component={Discussion}
					/>
					<Route exact path="/b/:boardID" component={Board} />
				</Switch>
			</Router>*/}
		</div>
	);
}

export default App;
