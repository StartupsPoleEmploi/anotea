import React from 'react';
import './Verified.scss';

export default function Verified() {
    return (
        <div className="Verified text-center">
            <span>vérifiés par</span>
            <img
                className="logo"
                src={`/images/poleemploi.png`}
                alt="logo Pôle Emploi" />
        </div>
    );
}
