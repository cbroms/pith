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

const postsDummy = [
	{
		created_at: "2020-10-06T02:28:52.000Z",
		author: "Christian",
		pith: "This is some cool text and stuff!",
		id: "2o3iupoweuqo",
	},
	{
		created_at: "2020-10-06T02:36:31.000Z",
		author: "Christian",
		pith:
			"Here's another interesting post of mine. This time it has some <em>formatting</em>",
		id: "2o32o467o3y364",
	},
	{
		created_at: "2020-10-06T04:41:45.000Z",
		author: "Jimmy",
		pith: "Something new",
		id: "2o32o46sdaf7o3y364",
	},
];

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

function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Discussion posts={postsDummy} document={documentDummy} />
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
