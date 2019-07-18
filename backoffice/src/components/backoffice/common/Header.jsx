import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import { NavLink, Route } from 'react-router-dom';
import logo from './Header.svg';
import { stats } from './../moderateur/moderation/moderationService';

const Link = ({ label, url, className }) => {
    return (
        <NavLink
            to={url}
            isActive={(match, location) => {
                //Ignore parameters when comparing the current location with the link url
                let baseUrl = url.indexOf('?') === -1 ? url : url.split('?')[0];
                return location.pathname.indexOf(baseUrl) !== -1;
            }}
            className={className}
            activeClassName="active">
            {label}
        </NavLink>
    );
};

Link.propTypes = {
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
};

export default class Header extends React.Component {

    state = {};

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.fetchStats();
    }

    fetchStats = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let computedStats = await stats();
                let avis = computedStats.status.none;
                let reponses = computedStats.reponseStatus.none;
                this.setState({ avis, reponses, loading: false }, () => resolve());
            });
        });
    };

    render() {

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;
                let isOrganismesTemplates = location.pathname.indexOf('/admin/courriels/templates-organismes') !== -1;
                let isStagiairesTemplates = location.pathname.indexOf('/admin/courriels/templates-stagiaires') !== -1;

                return (
                    <div className={`Header ${isModeration ? 'moderation' : 'misc'}`}>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <NavLink to="/admin">
                                            <img src={logo} className="logo" alt="logo" />
                                        </NavLink>
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
                                                    {/* {!this.state.loading &&
                                                        <span className="badge badge-light pastille"></span>
                                                    } */}
                                                </a>
                                                <div className="dropdown-menu">
                                                    <Link
                                                        className="dropdown-item"
                                                        label="Avis stagiaires"
                                                        url="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                                                    {!this.state.loading &&
                                                        <span className="badge badge-light pastille">{this.state.avis}</span>
                                                    }
                                                    <Link
                                                        className="dropdown-item"
                                                        label="Réponses des organismes"
                                                        url="/admin/moderateur/moderation/avis/reponses?page=0&reponseStatus=none" />
                                                    {!this.state.loading &&
                                                        <span className="badge badge-light pastille">{this.state.reponses}</span>
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
                                        <button
                                            onClick={this.props.onLogout}
                                            className="logout btn btn-outline-light">
                                            <span>SE DECONNECTER</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }} />

        );
    }
}
