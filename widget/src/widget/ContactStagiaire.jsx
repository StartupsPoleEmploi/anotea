import React, { Component } from 'react';

import styles from './contactStagiaire.css.js';

export default class ContactStagiaire extends Component {

    constructor() {
        super();
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:parseInt(process.env.REACT_APP_ANOTEA_HOTJAR_ID) || 0,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    }

    triggerHotjar = () => {
        window.hj('trigger', 'ancien_stagiaire');
    }

    render() {
        return (
            <span className="stars">
                <style>{styles}</style>
                <button className="btn" onClick={this.triggerHotjar}>Contacter un ancien stagiaire</button> 
            </span>
        );
    }
}
