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
	smallFont: "14px",
	mediumFont: "16px",
	largeFont: "20px",
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
function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<Discussion posts={postsDummy} />
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
