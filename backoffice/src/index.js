import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './utils/datepicker.js';
import './utils/moment-fr';
import App from './App';
import * as Sentry from './utils/sentry';
import * as Hotjar from './utils/hotjar';
import * as GoogleAnalytics from './utils/googleAnalytics';
import WithRouter from './components/WithRouter';
import { BrowserRouter as Router } from 'react-router-dom';
import { createRouter } from './utils/router';

let env = process.env;
let debug = false;

Sentry.initialize(env.REACT_APP_ANOTEA_SENTRY_DSN);
Hotjar.initialize(env.REACT_APP_ANOTEA_HOTJAR_ID);
GoogleAnalytics.initialize(env.REACT_APP_ANOTEA_GOOGLE_ANALYTICS_ID, { debug });

let app = (
    <Router>
        <WithRouter render={props => {
            let router = createRouter(props);
            return <App router={router} debug={debug} />;
        }} />
    </Router>
);
ReactDOM.render(app, document.getElementById('root'));
