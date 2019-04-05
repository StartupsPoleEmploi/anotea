import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './AnoteaWidget';

class WidgetAnotea extends HTMLElement {
    connectedCallback() {
        const widget = document.createElement('div');
        document.getElementById('widgetAnotea').appendChild(widget);
        const shadowRoot = widget.attachShadow({mode: 'closed'});
        ReactDOM.render(<AnoteaWidget />, shadowRoot);
    }
}

customElements.define('widget-anotea', WidgetAnotea);
