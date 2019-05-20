import React from 'react';
import './Footer.scss';

export default function Footer() {
    return (
        <div className="Footer">
            <span>Propulsé par</span>
            <img className="logo pl-1" src={`/images/logo.png`} alt="logo Anotea" />
        </div>
    );
}
