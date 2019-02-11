import React, { Component } from 'react';

import './noMatch.scss';

class NoMatch extends Component {

    render() {
        return (
            <div className="no-match">
                <header>
                    <br />
                    <img src="/img/logo_Anotea_Vertical_baseline2.png" alt="" className="logo-anotea" />
                    <div className="propulsed">
                        <span>Service propulsé par</span>
                        <img src="/img/poleemploi.png" alt="" className="logo-pe" />
                    </div>
                </header>

                <section className="error-page">
                    <h2>Page introuvable</h2>
                    <p>Le contenu auquel vous tentez d'accéder n'existe pas ou plus.</p>
                </section>
            </div>
        );
    }
}

export default NoMatch;
