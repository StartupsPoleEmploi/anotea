import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './utils/moment-fr';
import App from './App';
import WebFont from 'webfontloader';
import * as Sentry from './utils/sentry';
import * as Hotjar from './utils/hotjar';
import * as GoogleAnalytics from './components/analytics/AnalyticsContext';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { createRouter } from './utils/router';

let env = process.env;

WebFont.load({
    google: {
        families: ['Lato']
    }
});

Sentry.initialize(env.REACT_APP_ANOTEA_SENTRY_DSN);
Hotjar.initialize(env.REACT_APP_ANOTEA_HOTJAR_ID);
GoogleAnalytics.initialize(env.REACT_APP_ANOTEA_GOOGLE_ANALYTICS_ID, { debug: false });

let app = (
    <Router>
        <Switch>
            <Redirect exact from="/" to="/admin" />
        </Switch>
        <Route path="/admin" render={props => {
            let router = createRouter(props);
            return <App router={router} />;
        }}
        />

    </Router>
);
ReactDOM.render(app, document.getElementById('root'));
