import React, { Component } from 'react';
import logo from '../images/logo-pole-emploi.svg';
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
                <span>vérifiés par</span>
                <img
                    className="logo"
                    src={logo}
                    alt="Pôle Emploi" />
            </div>
        );
    }
}
