import React, { Component } from 'react';

export default class Verified extends Component {

    render() {
        return (
            <div className="verified">
                vérifiés par <img src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
            </div>
        );
    }
}
