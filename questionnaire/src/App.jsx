import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Funnel from './components/Funnel';
import ErrorPage from './components/pages/ErrorPage';
import './App.scss';

class App extends Component {

    render() {
        return (
            <div className="anotea">
                <Router>
                    <div>
                        <Route path={`/`} exact component={ErrorPage} />
                        <Route path={`/questionnaire`} exact component={ErrorPage} />
                        <Route
                            path={`/questionnaire/:token`}
                            render={props => <Funnel token={props.match.params.token} />} />
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;
