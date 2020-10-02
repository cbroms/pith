import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./App.css";

import LinkIcon from "./components/LinkIcon/LinkIcon";

import Board from "./components/Board";
import Discussion from "./components/Discussion";

const theme = {
	standardTextColor: "white",
	hoveredBackroundColor: "grey",
	smallFont: "14px",
	sans: "'Source Sans Pro', sans-serif",
	serif: "'Source Serif Pro', serif",
};

function App() {
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				This is some text and{" "}
				<LinkIcon forward={true} referenceNum={1} /> it includes a link
				too. <br /> Here's something else as well!{" "}
				<LinkIcon forward={true} referenceNum={4} />
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
