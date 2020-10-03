import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./App.css";

import LinkIcon from "./components/LinkIcon/LinkIcon";
import DiscussionLayout from "./components/DiscussionLayout";
import Discussion from "./components/Discussion";

const theme = {
	standardTextColor: "white",
	hoveredBackgroundColor: "grey",
	smallFont: "14px",
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
