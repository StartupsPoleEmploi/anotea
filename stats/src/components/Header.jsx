import React from 'react';
import './Header.scss';
import logo from './images/logo-anotea.png'

export default function Header() {
    return (
        <div className="Header">
            <img className="logo" src={logo} alt="logo Anotea" />
            <div className="title">A header</div>
        </div>
    );
}