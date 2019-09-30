import React from 'react';
import Link from '../common/header/Link';

export default function OrganismeHeaderItems() {

    return (
        <ul className="nav">
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Avis stagiaires"
                    url="/admin/organisme/avis/stats" />
            </li>
            <li className="nav-item right">
                <Link
                    className="nav-link"
                    url="/admin/organisme/mon-compte"
                    label="Mon compte" />
            </li>
        </ul>
    );
}

