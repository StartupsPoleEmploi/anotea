import React from 'react';
import Link from '../common/header/Link';
import { getStats } from './moderation-avis/moderationService';
import { Route } from 'react-router-dom';

export default class ModerateurHeaderItems extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            avis: 0,
            reponses: 0,
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    fetchStats = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let stats = await getStats();
                let avis = stats.status.none;
                let reponses = stats.reponseStatus.none;
                this.setState({ avis, reponses, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { avis, reponses, loading } = this.state;

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;
                let isCourriels = location.pathname.indexOf('/admin/moderateur/courriels') !== -1;

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
                            <a
                                href="#"
                                className={`nav-link dropdown-toggle  ${isCourriels ? 'active' : ''}`}
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
                                    url="/admin/moderateur/courriels/stagiaires"
                                    label="Stagiaires" />
                                <Link
                                    className="nav-link"
                                    url="/admin/moderateur/courriels/organismes"
                                    label="Organismes" />
                            </div>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                url="/admin/moderateur/mon-compte"
                                label="Mon compte" />
                        </li>
                    </ul>
                );
            }} />
        );
    }
}
