import React from 'react';
import Link from '../common/header/Link';

export default function OrganismeHeaderItems() {

    return (
		<nav aria-label="principale">
        <ul className="nav">
            <li className="nav-item">
                <Link className="nav-link" url="/backoffice/organisme/avis/liste?dispensateur=true&amp;responsable=true">
                    Avis stagiaires
                </Link>
            </li>
            <li className="nav-item right">
                <Link className="nav-link" url="/backoffice/organisme/mon-compte">
                    Mon compte
                </Link>
            </li>
        </ul>
		</nav>
    );
}

