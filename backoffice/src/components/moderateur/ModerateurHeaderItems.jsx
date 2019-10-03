import React from 'react';
import Link from '../common/header/Link';
import { getAvisStats } from '../../services/statsService';
import { Route } from 'react-router-dom';

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

        let { stats, loading } = this.state;

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;
                let isCourriels = location.pathname.indexOf('/admin/moderateur/courriels') !== -1;

                return (
                    <ul className="nav">
                        <li className="nav-item dropdown">
                            <a
                                href="#"
                                className={`nav-link dropdown-toggle ${isModeration ? 'active' : ''}`}
                                data-toggle="dropdown"
                                role="button"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                Moderation
                            </a>
                            <div className="dropdown-menu">
                                <div className="d-flex align-items-center">
                                    <Link
                                        className="dropdown-item"
                                        label="Avis stagiaires"
                                        url="/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&status=none" />
                                    {!loading && stats.nbAModerer &&
                                    <span className="badge badge-light pastille">{stats.nbAModerer}</span>
                                    }
                                </div>
                                <div className="d-flex align-items-center">
                                    <Link
                                        className="dropdown-item"
                                        label="Réponses des organismes"
                                        url="/admin/moderateur/moderation/avis/reponses?reponseStatuses=none&sortBy=reponse.lastStatusUpdate" />
                                    {!loading && stats.nbReponseAModerer &&
                                    <span className="badge badge-light pastille">{stats.nbReponseAModerer}</span>
                                    }
                                </div>
                            </div>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                label="Liste des organismes"
                                url="/admin/moderateur/gestion/organismes" />
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
