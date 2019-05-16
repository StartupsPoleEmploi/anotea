import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import WebFont from 'webfontloader';
import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import * as serviceWorker from './serviceWorker';
import App from './App';

WebFont.load({
    google: {
        families: ['Lato']
    }
});

serviceWorker.unregister();

const qs = queryString.parse(window.location.search);

ReactDOM.render(<App {...qs} />, document.getElementById('root'));
