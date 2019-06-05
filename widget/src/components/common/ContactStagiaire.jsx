import React, { Component } from 'react';
import './ContactStagiaire.scss';

export default class ContactStagiaire extends Component {

    componentDidMount() {
        (function(h, o, t, j, a, r) {
            h.hj = h.hj || function() {
                (h.hj.q = h.hj.q || []).push(arguments);
            };
            h._hjSettings = { hjid: parseInt(process.env.REACT_APP_ANOTEA_HOTJAR_ID) || 0, hjsv: 6 };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    render() {
        return (
            <span className="ContactStagiaire">
                <button
                    className="btn"
                    onClick={() => window.hj('trigger', 'ancien_stagiaire')}>
                    Contacter un ancien stagiaire
                </button>
            </span>
        );
    }
}
