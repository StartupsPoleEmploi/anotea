import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './AnoteaWidget';

class WidgetAnotea extends HTMLElement {
    connectedCallback() {
        const widget = document.createElement('div');
        this.appendChild(widget);
        const shadowRoot = widget.attachShadow({mode: 'closed'});
        ReactDOM.render(<AnoteaWidget layout={this.getAttribute('layout')} width={this.getAttribute('width')} niveau={this.getAttribute('niveau')} siret={this.getAttribute('siret')} numeroAction={this.getAttribute('numeroAction')} />, shadowRoot);
    }
}

customElements.define('widget-anotea', WidgetAnotea);
