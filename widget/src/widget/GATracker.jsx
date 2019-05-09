
import React, { Component } from 'react';

export default class GATracker extends Component {

    constructor() {
        super();
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.getID());
    }

    getID = () => process.env.ANOTEA_WIDGET_GOOGLE_ANALYTICS_ID;

    render() {
        return (
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${this.getID()}`}></script>
        );
    }
}
