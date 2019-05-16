import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import AnoteaWidget from './widget/AnoteaWidget';
import AnoteaScoreWidget from './widget/AnoteaScoreWidget';
import '@webcomponents/webcomponentsjs'
import WebFont from 'webfontloader';

class AnoteaWebComponent extends HTMLElement {

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    createWidget = layout => {
        return (
            <AnoteaWidget
                width={this.getAttribute('width')}
                layout={layout}
                type={this.getAttribute('type')}
                siret={this.getAttribute('siret')}
                numeroAction={this.getAttribute('numeroAction')}
                numeroSession={this.getAttribute('numeroSession')}
                numeroFormation={this.getAttribute('numeroFormation')} />
        )
    };

    createScoreWidget = () => {
        return (
            <AnoteaScoreWidget
                type={this.getAttribute('type')}
                siret={this.getAttribute('siret')}
                numeroAction={this.getAttribute('numeroAction')}
                numeroSession={this.getAttribute('numeroSession')}
                numeroFormation={this.getAttribute('numeroFormation')} />
        );
    };

    connectedCallback() {

        let widget = null;

        switch (this.getAttribute('layout')) {
            case 'score':
                widget = this.createScoreWidget();
                break;
            case 'liste':
                widget = this.createWidget('liste');
                break;
            default:
                widget = this.createWidget('carrousel');
        }

        ReactDOM.render(widget, this.root, () => {
            WebFont.load({ google: { families: ['Lato'] } });

            let fontawesome = document.createElement('link');
            fontawesome.type = 'text/css';
            fontawesome.rel = 'stylesheet';
            fontawesome.href = '/vendors/fontawesome/css/svg-with-js.css';
            this.root.appendChild(fontawesome);

            let styles = document.createElement('link');
            styles.type = 'text/css';
            styles.rel = 'stylesheet';
            styles.href = '/widget.css';
            this.root.appendChild(styles);
        });
    }

    disconnectedCallback() {
        ReactDOM.unmountComponentAtNode(this);
    }
}

customElements.define('anotea-widget', AnoteaWebComponent);
