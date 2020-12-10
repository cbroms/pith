import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import "./App.css";

import { setValue, getValue } from "./api/local";

import AppLayout from "./AppLayout";

import Discussion from "./components/Discussion";
import DiscussionJoin from "./components/DiscussionJoin";
import AlphaBoard from "./components/AlphaBoard";

import dark from "./themes/dark";
import light from "./themes/light";

const mapStateToProps = (state, ownProps) => {
	return { ...state };
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			darkModeActive: getValue("darkModeActive"),
		};

		this.setDarkModeActive = this.setDarkModeActive.bind(this);
	}

	componentDidMount() {
		// const discussionId = "9ea4d942e69848a58afe7c33462f4d39"; // dummy
		// const nickname = "softal";
		// const { dispatch } = this.props;
		// dispatch(enterUser(discussionId));
		// dispatch(createUser(discussionId, nickname));
		//dispatch(createPost("Hello."));
	}

	setDarkModeActive(mode) {
		setValue("darkModeActive", mode);
		this.setState({ darkModeActive: mode });
	}

	render() {
		let theme;

		if (this.state.darkModeActive !== null) {
			theme = this.state.darkModeActive ? dark : light;
		} else {
			if (window.matchMedia("(prefers-color-scheme: light)").matches) {
				theme = light;
			} else theme = dark; // default to dark mode
		}

		return (
			<div className="App">
				<ThemeProvider theme={theme}>
					<Router>
						<AppLayout>
							<Switch>
								<Route path="/" exact>
									<AlphaBoard
										{...this.props.board}
										dispatch={this.props.dispatch}
										setDarkMode={(val) =>
											this.setDarkModeActive(val)
										}
									/>
								</Route>
								<Route path="/d/:discussionId" >
									<Discussion
										{...this.props.discussion}
										dispatch={this.props.dispatch}
										setDarkMode={(val) =>
											this.setDarkModeActive(val)
										}
									/>
								</Route>
							</Switch>
						</AppLayout>
					</Router>
				</ThemeProvider>
			</div>
		);
	}
}

export default connect(mapStateToProps)(App);
