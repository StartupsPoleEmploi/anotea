import React, { Component } from 'react';
import './ContactStagiaire.scss';

export default class ContactStagiaire extends Component {

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
