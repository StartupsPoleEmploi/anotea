import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './AnoteaWidget';
import AnoteaTinyWidget from './AnoteaTinyWidget';

class WidgetAnotea extends HTMLElement {

    node = null;

    currentLayout = null;

    createRoot = () => {
        if (this.node !== null) {
            console.log("remove")
            this.node.remove();
        }
        this.node = document.createElement('div');
        this.appendChild(this.node);
        return this.node.attachShadow({mode: 'closed'});
    }


    doRender = layout => {
        this.currentLayout = layout;
        this.root = this.createRoot();
        ReactDOM.render(<AnoteaWidget
            width={this.getAttribute('width')}
            layout={layout}
            niveau={this.getAttribute('niveau')}
            siret={this.getAttribute('siret')}
            numeroAction={this.getAttribute('numeroAction')}
            numeroSession={this.getAttribute('numeroSession')}
            numeroFormation={this.getAttribute('numeroFormation')} />, this.root);
    }

    renderWidget = () => {         
        if(this.getAttribute('layout') === 'large') {
            if (window.innerWidth > 780 && this.currentLayout !== 'large') {
                this.doRender('large');
            } else if (window.innerWidth <= 780 && this.currentLayout !== 'small') {
                this.doRender('small');
            }
        } else if (this.node === null) {
            this.doRender('small');
        }
    }

    connectedCallback() {
        window.onresize = this.renderWidget;
        this.layout = this.getAttribute('layout');
        if(this.layout === 'tiny') {
            let root = this.createRoot();
            ReactDOM.render(<AnoteaTinyWidget
                niveau={this.getAttribute('niveau')}
                siret={this.getAttribute('siret')}
                numeroAction={this.getAttribute('numeroAction')}
                numeroSession={this.getAttribute('numeroSession')}
                numeroFormation={this.getAttribute('numeroFormation')} />, root);
        } else {
            this.renderWidget();
        }
    }
}

customElements.define('widget-anotea', WidgetAnotea);
