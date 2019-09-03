import React from 'react';
import Link from '../common/header/Link';

export default function FinanceurHeaderItems() {

    let publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:3003';

    return (
        <ul className="nav">
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Avis stagiaire"
                    url="/admin/financeur/avis" />
            </li>
            <li className="nav-item">
                <a href={`${publicUrl}/stats`} target="_blank" rel="noopener noreferrer" className="nav-link">Statistiques</a>
            </li>
            <li className="nav-item right">
                <Link
                    className="nav-link"
                    url="/admin/financeur/mon-compte"
                    label="Mon compte" />
            </li>
        </ul>
    );
}

