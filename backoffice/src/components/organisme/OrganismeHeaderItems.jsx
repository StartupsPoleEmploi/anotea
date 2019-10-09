import React from 'react';
import Link from '../common/header/Link';

export default function OrganismeHeaderItems() {

    return (
        <ul className="nav">
            <li className="nav-item">
                <Link className="nav-link" url="/admin/organisme/avis/stats">
                    Avis stagiaires
                </Link>
            </li>
            <li className="nav-item right">
                <Link className="nav-link" url="/admin/organisme/mon-compte">
                    Mon compte
                </Link>
            </li>
        </ul>
    );
}

