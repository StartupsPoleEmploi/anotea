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
import WithRouter from './components/WithRouter';
import { BrowserRouter as Router } from 'react-router-dom';
import { createNavigator } from './utils/navigator';

Sentry.init();

let app = (
    <Router>
        <WithRouter render={props => {
            let navigator = createNavigator(props);
            return <App navigator={navigator} />;
        }} />
    </Router>
);
ReactDOM.render(app, document.getElementById('root'));
