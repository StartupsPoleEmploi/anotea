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
                    <div className={`col-sm-${stagiaire ? '2' : '3'} offset-lg-${stagiaire ? '2' : '3'}`}>
                        <img
                            className="logo"
                            src={`${process.env.PUBLIC_URL}/images/logo.png`}
                            alt="logo Anotéa" />
                    </div>
                    <div className={`col-sm-${stagiaire ? '2' : '3'}`}>
                        <img className="logo-pe" src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
                    </div>
                    {!!stagiaire &&
                    <div className="col-sm-2">
                        <img
                            className="logo-region"
                            src={`/img/regions/logo-questionnaire/region-${stagiaire.codeRegion}.png`}
                            alt="logo région" />
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default Footer;
