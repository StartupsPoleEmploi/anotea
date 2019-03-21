import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './footer.scss';

class Footer extends Component {

    static propTypes = {
        stagiaire: PropTypes.string
    };

    render() {
        let { stagiaire } = this.props;

        return (
            <div className="footer container">
                <div className="row">
                    <div className="col-sm-6 offset-lg-3">
                        <span className="propulsed">Service propulsé par</span>
                        <img className="logo-pe" src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
                        {stagiaire && stagiaire.codeRegion &&
                        <img
                            className="logo-region"
                            src={`/img/regions/logo-questionnaire/region-${stagiaire.codeRegion}.png`}
                            alt="logo région" />
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6 offset-lg-3">
                        <img className="logo" src={`${process.env.PUBLIC_URL}/images/logo.png`}
                             alt="logo Anotéa" />
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
