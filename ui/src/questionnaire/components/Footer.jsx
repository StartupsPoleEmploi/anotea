import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logoRF from '../images/logo2021-marianne.svg';
import logoPE from '../images/logo-pole-emploi.png';
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
                    <div className="col-sm-12 offset-md-1 col-md-10 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        <img className="logo" src={logoRF} width="25%" />
                        <img className="logo" src={logoPE} alt="France Travail" width="25%" />
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
