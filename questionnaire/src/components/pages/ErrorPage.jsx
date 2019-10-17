import React, { Component } from 'react';
import './errorPage.scss';
import Footer from '../common/Footer';
import logo from '../../images/logo_Anotea_Horizontal_baseline2.png';

export default class ErrorPage extends Component {

    render() {
        return (
            <div className="error-page">
                <img src={logo} alt="" class="logoAnotea" />
                <section className="error-page">
                    <h2>Le questionnaire n'est plus disponible</h2>
                </section>
                <Footer />
            </div>
        );
    }
}
