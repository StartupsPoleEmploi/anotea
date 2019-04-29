import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './AnoteaWidget';
import AnoteaTinyWidget from './AnoteaTinyWidget';

class WidgetAnotea extends HTMLElement {
    connectedCallback() {
        const widget = document.createElement('div');
        this.appendChild(widget);
        const shadowRoot = widget.attachShadow({mode: 'closed'});
        const layout = this.getAttribute('layout');
        if(layout === 'tiny') {
            ReactDOM.render(<AnoteaTinyWidget width={this.getAttribute('width')} niveau={this.getAttribute('niveau')} siret={this.getAttribute('siret')} numeroAction={this.getAttribute('numeroAction')} />, shadowRoot);
        } else {
            ReactDOM.render(<AnoteaWidget layout={layout} niveau={this.getAttribute('niveau')} siret={this.getAttribute('siret')} numeroAction={this.getAttribute('numeroAction')} />, shadowRoot);
        }
    }
}

customElements.define('widget-anotea', WidgetAnotea);
