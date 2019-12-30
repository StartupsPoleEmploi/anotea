import React from 'react';
import logo from '../images/logo-pole-emploi.svg';
import './Verified.scss';

export default function Verified() {
    return (
        <div className="Verified text-center">
            <span>vérifiés par</span>
            <img
                className="logo"
                src={logo}
                alt="logo Pôle Emploi" />
        </div>
    );
}
