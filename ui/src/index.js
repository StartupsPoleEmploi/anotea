import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './common/utils/moment-fr';
import WebFont from 'webfontloader';
import * as Sentry from './common/utils/sentry';
import * as TagCommander from './common/components/analytics/TagCommander';
import * as GoogleAnalytics from './common/components/analytics/AnalyticsContext';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { createRouter } from './common/utils/router';
import Widget from './widget/Widget';
import GridDisplayer from './common/components/GridDisplayer';
import './common/styles/global.scss';
import { Chunk } from './backoffice/components/common/Chunk';

let env = process.env;

WebFont.load({
    google: {
        families: ['Lato:400,700,900']
    }
});

//Hotjar.initialize(env.REACT_APP_ANOTEA_HOTJAR_ID);
TagCommander.initialize(env.NODE_ENV === 'production');
GoogleAnalytics.initialize();
Sentry.initialize(env.REACT_APP_ANOTEA_SENTRY_DSN);

let BackofficeChunksLoader = React.lazy(() => import('./backoffice/Backoffice'));
let QuestionnaireChunksLoader = React.lazy(() => import('./questionnaire/Questionnaire'));

let app = (
    <Router>
        <Switch>
            <Redirect exact from="/" to="/backoffice" />
            <Redirect exact from="/stats" to="/backoffice/stats" />
            <Redirect from="/admin*" to="/backoffice*" />
        </Switch>

        <Route path="/widget" render={() => <Widget />} />
        <Route path="/questionnaire" render={() => {
            return <Chunk name="questionnaire" load={() => (<QuestionnaireChunksLoader />)} />;
        }} />
        <Route path="/backoffice" render={props => {
            return <Chunk name="backoffice" load={() => (<BackofficeChunksLoader router={createRouter(props)} />)} />;
        }} />
        {false && <GridDisplayer />}
    </Router>
);
ReactDOM.render(app, document.getElementById('root'));
