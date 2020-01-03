import React from "react";
import Link from "../common/header/Link";

export default function FinanceurHeaderItems() {

    let publicUrl = process.env.PUBLIC_URL ? "" : "http://localhost:3003";

    return (
        <ul className="nav">
            <li className="nav-item">
                <Link className="nav-link" url="/admin/financeur/avis/stats">
                    Avis stagiaires
                </Link>
            </li>
            <li className="nav-item">
                <a href={`${publicUrl}/stats`} target="_blank" rel="noopener noreferrer" className="nav-link">Statistiques
                    Anotéa</a>
            </li>
            <li className="nav-item right">
                <Link className="nav-link" url="/admin/financeur/mon-compte">
                    Mon compte
                </Link>
            </li>
        </ul>
    );
}

