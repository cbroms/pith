import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./App.css";

import LinkIcon from "./components/LinkIcon/LinkIcon";
import DiscussionLayout from "./components/DiscussionLayout";
// import Discussion from "./components/Discussion";

const theme = {
	textColor1: "white",
	textColor2: "#afafaf",
	textColor3: "#565656",
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

function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<DiscussionLayout />
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
