import React from 'react';
import Link from '../common/header/Link';
import { getAvisStats } from '../../services/statsService';
import { Route } from 'react-router-dom';
import Pastille from '../common/Pastille';

export default class ModerateurHeaderItems extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stats: {},
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    fetchStats = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let stats = await getAvisStats();
                this.setState({ stats, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { stats } = this.state;

        return (
            <Route render={({ location }) => {

                let isCourriels = location.pathname.indexOf('/admin/moderateur/courriels') !== -1;

                return (
                    <ul className="nav">
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                url="/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none"
                            >
                                <div className="Pastille--holder">
                                    Avis
                                    {stats.nbAModerer > 0 && <Pastille />}
                                </div>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                url="/admin/moderateur/moderation/avis/reponses?reponseStatuses=none&sortBy=reponse.lastStatusUpdate"
                            >
                                <div className="Pastille--holder">
                                    Réponses
                                    {(stats.nbReponseAModerer > 0 || stats.nbSignales > 0) && <Pastille />}
                                </div>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" url="/admin/moderateur/gestion/organismes">
                                Organismes
                            </Link>
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
                                <Link className="nav-link" url="/admin/moderateur/courriels/stagiaires">
                                    Stagiaires
                                </Link>
                                <Link className="nav-link" url="/admin/moderateur/courriels/organismes">
                                    Organismes
                                </Link>
                            </div>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" url="/admin/moderateur/mon-compte">
                                Mon compte
                            </Link>
                        </li>
                    </ul>
                );
            }} />
        );
    }
}
