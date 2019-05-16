import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import App from './App';
import * as serviceWorker from './serviceWorker';

serviceWorker.unregister();

const qs = queryString.parse(window.location.search);

ReactDOM.render(<App {...qs} />, document.getElementById('root'));
