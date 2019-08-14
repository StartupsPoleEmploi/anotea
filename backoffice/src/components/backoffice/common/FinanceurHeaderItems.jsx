import React from 'react';
import Link from './Link';

export default function FinanceurHeaderItems() {
    
    return (
        <ul className="nav">
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Avis stagiaire"
                    url="/admin/financeur/avis" />
            </li>
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Statistiques Anotéa"
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

