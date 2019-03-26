import React, { Component } from 'react';
import './errorPage.scss';

export default class ErrorPage extends Component {

    render() {
        return (
            <div className="error-page">
                <section className="error-page">
                    <h2>Page introuvable</h2>
                    <p>Le contenu auquel vous tentez d&apos;accéder n&apos;existe pas ou plus.</p>
                </section>
            </div>
        );
    }
}
