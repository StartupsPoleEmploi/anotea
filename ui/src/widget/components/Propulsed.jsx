import React from 'react';
import logo from '../images/logo-anotea.png';
import './Propulsed.scss';

export default function Propulsed() {
    return (
        <div className="Propulsed">
            <span>Propulsé par</span>
            <img className="logo pl-1" src={logo} alt="Anotea" />
        </div>
    );
}
