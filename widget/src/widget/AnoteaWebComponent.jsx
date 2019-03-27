import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './AnoteaWidget';

class WidgetAnotea extends HTMLElement {
    connectedCallback() {
        ReactDOM.render(<AnoteaWidget />, document.getElementById('widgetAnotea'));
    }
}

customElements.define('widget-anotea', WidgetAnotea);
