import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logo from '../images/Bloc_Marque_RF_France_Travail_RVB_Horizontal_Coul_Positif.svg';
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
                        <img className="logo" src={logo} alt="France Travail" width="50%" />
                        {infosRegion.region.conseil_regional.active &&
                        <img
                            className="logo"
                            src={process.env.PUBLIC_URL + `/images/regions/conseil-regional-${stagiaire.codeRegion}.png`}
                            alt="région" />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
