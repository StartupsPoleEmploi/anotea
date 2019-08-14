import React from 'react';
import PropTypes from 'prop-types';
import Link from './Link';

export default function ModerateurHeaderItems({ isModeration, isStagiairesTemplates, isOrganismesTemplates, avis, reponses, loading }) {
    
    return (
        <ul className="nav">
            <li className="nav-item dropdown">
                <a href="#"
                    className={`nav-link dropdown-toggle ${isModeration ? 'active' : ''}`}
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    Moderation
                </a>
                <div className="dropdown-menu">
                    <Link
                        className="dropdown-item"
                        label="Avis stagiaires"
                        url="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                    {!loading &&
                        <span className="badge badge-light pastille">{avis}</span>
                    }
                    <Link
                        className="dropdown-item"
                        label="Réponses des organismes"
                        url="/admin/moderateur/moderation/avis/reponses?page=0&reponseStatus=none" />
                    {!loading &&
                        <span className="badge badge-light pastille">{reponses}</span>
                    }
                </div>
            </li>
            <li className="nav-item">
                <Link
                    className="nav-link"
                    label="Liste des organismes"
                    url="/admin/moderateur/gestion/organismes?page=0&status=active" />
            </li>
            <li className="nav-item dropdown">
                <a href="#"
                    className={`nav-link dropdown-toggle  ${isStagiairesTemplates || isOrganismesTemplates ? 'active' : ''}`}
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    Courriels
                </a>
                <div className="dropdown-menu">
                    <Link
                        className="nav-link"
                        url="/admin/courriels/templates-stagiaires"
                        label="Stagiaires" />
                    <Link
                        className="nav-link"
                        url="/admin/courriels/templates-organismes"
                        label="Organismes" />
                </div>
            </li>
            <li className="nav-item">
                <Link
                    className="nav-link"
                    url="/mon-compte"
                    label="Mon compte" />
            </li>
        </ul>
    );
}

ModerateurHeaderItems.propTypes = {
    isModeration: PropTypes.bool.isRequired,
    isStagiairesTemplates: PropTypes.bool.isRequired,
    isOrganismesTemplates: PropTypes.bool.isRequired,
    avis: PropTypes.number.isRequired,
    reponses: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired
};
