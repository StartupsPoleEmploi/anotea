import React from 'react';
import Link from '../common/header/Link';

export default function FinanceurHeaderItems() {

    return (
        <ul className="nav">
            <li className="nav-item">
                <Link className="nav-link" url="/backoffice/financeur/avis">
                    Avis stagiaires
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" url="/backoffice/stats">
                    Statistiques Anotéa
                </Link>
            </li>
            <li className="nav-item right">
                <Link className="nav-link" url="/backoffice/financeur/mon-compte">
                    Mon compte
                </Link>
            </li>
        </ul>
    );
}

