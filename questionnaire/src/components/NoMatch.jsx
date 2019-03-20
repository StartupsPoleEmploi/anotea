import React, { Component } from 'react';
import Footer from './common/Footer';
import './noMatch.scss';

class NoMatch extends Component {

    render() {
        return (
            <div className="no-match">
                <section className="error-page">
                    <h2>Page introuvable</h2>
                    <p>Le contenu auquel vous tentez d&apos;accéder n&apos;existe pas ou plus.</p>
                </section>
                <Footer />
            </div>
        );
    }
}

export default NoMatch;
