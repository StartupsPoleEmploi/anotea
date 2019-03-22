import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './footer.scss';

class Footer extends Component {

    static propTypes = {
        stagiaire: PropTypes.object
    };

    render() {

        let { stagiaire } = this.props;

        return (
            <div className="footer container">
                <div className="row mb-4">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <div className="d-flex justify-content-center">
                            <span className="propulsed">Service propulsé par</span>
                        </div>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <img
                            className="logo"
                            src={`${process.env.PUBLIC_URL}/images/logo.png`}
                            alt="logo Anotéa" />
                        <img className="logo" src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
                        {!!stagiaire &&
                        <img
                            className="logo"
                            src={`/img/regions/logo-questionnaire/region-${stagiaire.codeRegion}.png`}
                            alt="logo région" />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
