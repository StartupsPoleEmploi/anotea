import React, { Component } from 'react';
import './badwords.scss';

export default class Badwords extends Component {

    render() {
        return (
            <div className="badwords">
                Votre commentaire comporte une ou plusieurs injures, <strong>veuillez corriger votre
                commentaire</strong>.
            </div>
        );
    }
}
