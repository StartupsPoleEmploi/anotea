import React, { Component } from 'react';
import logoRF from '../images/Republique_Francaise_RVB.png';
import logoAnotea from '../images/logo-anotea.png';
import PropTypes from 'prop-types';
import './Verified.scss';

export default class Verified extends Component {

    static propTypes = {
        className: PropTypes.string,
    };

    render() {

        let { className } = this.props;

        return (
            <div className={`Verified text-center ${className || ''}`}>
                <img
                    className="logo"
                    src={logoRF} />
                <img
                    className="logo"
                    src={logoAnotea} />
            </div>
        );
    }
}
