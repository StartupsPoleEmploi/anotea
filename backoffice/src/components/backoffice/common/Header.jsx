import React from 'react';
import PropTypes from 'prop-types';
import logo from './Header.svg';
import './Header.scss';
import { NavLink } from 'react-router-dom';

export default class Header extends React.Component {

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="Header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-2">
                            <NavLink to="/admin">
                                <img src={logo} className="logo" alt="logo" />
                            </NavLink>
                        </div>
                        <div className="col-7">
                            <nav className="nav">
                                <NavLink
                                    to="/admin/moderation/avis/stagiaires?page=0&status=none"
                                    className="nav-link"
                                    activeClassName="active">
                                    Avis stagiaires
                                </NavLink>
                                <NavLink
                                    to="/admin/moderation/avis/reponses?page=0&reponseStatus=none"
                                    className="nav-link"
                                    activeClassName="active">
                                    Réponses des organismes
                                </NavLink>
                                <NavLink
                                    to="/admin/moderation/organismes?page=0&activated=true"
                                    className="nav-link"
                                    activeClassName="active">
                                    Gestion des organimes
                                </NavLink>
                            </nav>
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
    }
}
