import React from 'react';
import PropTypes from 'prop-types';
import logo from './Header.svg';
import './Header.scss';
import { NavLink, Route } from 'react-router-dom';

const Link = ({ label, url }) => {
    return (
        <NavLink
            to={url}
            isActive={(match, location) => {
                //Ignore parameters when comparing the current location with the link url
                let baseUrl = url.indexOf('?') === -1 ? url : url.split('?')[0];
                return location.pathname.indexOf(baseUrl) !== -1;
            }}
            className="nav-link"
            activeClassName="active">
            {label}
        </NavLink>
    );
};

Link.propTypes = {
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
};

export default class Header extends React.Component {

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
    };

    render() {

        return (
            <Route render={({ location }) => {

                let isSecondary = location.pathname.indexOf('/admin/moderation/organismes') !== -1;

                return (
                    <div className={`Header ${isSecondary ? 'organismes' : 'avis'}`}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-2">
                                    <NavLink to="/admin">
                                        <img src={logo} className="logo" alt="logo" />
                                    </NavLink>
                                </div>
                                <div className="col-7">
                                    <nav className="nav">
                                        <Link
                                            label="Avis stagiaires"
                                            url="/admin/moderation/avis/stagiaires?page=0&status=none" />

                                        <Link
                                            label=" Réponses des organismes"
                                            url="/admin/moderation/avis/reponses?page=0&reponseStatus=none" />

                                        <Link
                                            label="Gestion des organimes"
                                            url="/admin/moderation/organismes?page=0&activated=true" />
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
            }} />

        );
    }
}
