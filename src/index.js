import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Layout from "./Layout";
import ObituaryDisplay from "./ObituaryDisplay";
import CreateDisplay from "./CreateDisplay";
import reportWebVitals from "./reportWebVitals";

const App = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <Redirect to="/obituaries" />
          </Route>
          <Route exact path="/obituaries" component={ObituaryDisplay} />
          <Route exact path="/obituaries/create" component={CreateDisplay} />
          <Route path="*" component={ObituaryDisplay} />
        </Switch>
      </Layout>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
reportWebVitals();