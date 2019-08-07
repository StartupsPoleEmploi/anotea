import React from 'react';
import Link from './Link';

export default function ModerateurHeaderItems() {
    
    return (
        <ul className="nav">
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Avis stagiaire"
                    url="/admin/financeur" />
            </li>
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Statistiques"
                    url="/admin/statistiques" />
            </li>
            <li className="nav-item right">
                <Link
                    className="nav-link"
                    url="/mon-compte"
                    label="Mon compte" />
            </li>
        </ul>
    );
}

