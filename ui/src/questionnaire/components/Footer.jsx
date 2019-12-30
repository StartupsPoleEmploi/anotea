import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logo from '../images/logo-pole-emploi.svg';
import './footer.scss';

class Footer extends Component {

    static propTypes = {
        stagiaire: PropTypes.object,
        infosRegion: PropTypes.object,
    };

    render() {

        let { stagiaire, infosRegion } = this.props;

        return (
            <div className="footer container">
                <div className="row align-items-center">
                    <div className="col-sm-12 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        <span className="propulsed">Service propulsé par</span>
                        <img className="logo" src={logo} alt="logo Pôle Emploi" width="25%"/>
                        {infosRegion.region.conseil_regional.active &&
                        <img
                            className="logo"
                            src={process.env.PUBLIC_URL + `/images/regions/conseil-regional-${stagiaire.codeRegion}.png`}
                            alt="logo région" />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
