import React from 'react';
import logo from './images/logo-anotea.png';
import './Footer.scss';

export default function Footer() {
    return (
        <div className="Footer">
            <span>Propulsé par</span>
            <img className="logo pl-1" src={logo} alt="logo Anotea" />
        </div>
    );
}
