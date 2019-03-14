import React from 'react';
import PropTypes from 'prop-types';
import logo from './Header.svg';
import './Header.scss';
import { NavLink, Route } from 'react-router-dom';

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

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
    };

    render() {

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;

                return (
                    <div className={`Header ${isModeration ? 'moderation' : 'misc'}`}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-2">
                                    <NavLink to="/admin">
                                        <img src={logo} className="logo" alt="logo" />
                                    </NavLink>
                                </div>
                                <div className="col-7">
                                    <ul className="nav">
                                        <li className="nav-item dropdown">
                                            <a
                                                className={`nav-link dropdown-toggle ${isModeration ? 'active' : ''}`}
                                                data-toggle="dropdown"
                                                href="#"
                                                role="button"
                                                aria-haspopup="true"
                                                aria-expanded="false">
                                                Moderation
                                            </a>
                                            <div className="dropdown-menu">
                                                <Link
                                                    className="dropdown-item"
                                                    label="Avis stagiaires"
                                                    url="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                                                <Link
                                                    className="dropdown-item"
                                                    label=" Réponses des organismes"
                                                    url="/admin/moderateur/moderation/avis/reponses?page=0&reponseStatus=none" />
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link"
                                                label="Gestion des organismes"
                                                url="/admin/moderateur/gestion/organismes?page=0&status=active" />
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-3 text-right">
                                    <NavLink to="/mon-compte" className="account-link" activeClassName="active">
                                        <span className="fas fa-cog" />
                                    </NavLink>
                                    <button onClick={this.props.onLogout} className="logout btn btn-outline-light">
                                        <span>SE DECONNECTER</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }} />

        );
    }
}
