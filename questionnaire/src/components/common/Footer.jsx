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
                <div className="row align-items-center">
                    <div className="col-sm-12 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        <span className="propulsed">Service propulsé par</span>
                        <img className="logo" src={`/img/logo-pole-emploi-530.png`} alt="logo Pôle Emploi" />
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
