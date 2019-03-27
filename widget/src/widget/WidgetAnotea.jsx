import React from 'react';
import ReactDOM from 'react-dom';

class WidgetAnotea extends HTMLElement {
    connectedCallback() {
        ReactDOM.render(<div>Hello World!</div>, document.getElementById('widgetAnotea'));
    }
}

customElements.define('widget-anotea', WidgetAnotea);
