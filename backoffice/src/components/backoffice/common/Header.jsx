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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2 pl-5">
                            <NavLink to="/admin">
                                <img src={logo} className="logo" alt="logo" />
                            </NavLink>
                        </div>
                        <div className="col-md-7">
                            <nav className="nav">
                                <NavLink to="/admin/moderation/stagiaires/all" className="nav-link"
                                         activeClassName="active">
                                    Avis stagiaires
                                </NavLink>
                                <NavLink to="/admin/moderation/organismes" className="nav-link"
                                         activeClassName="active">
                                    Réponses des organimes
                                </NavLink>
                            </nav>
                        </div>
                        <div className="col-md-3 text-right pr-5">
                            <NavLink to="/mon-compte" className="account-link"
                                activeClassName="active">
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
