import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import BackofficeContext from '../../../BackofficeContext';
import logo from './logo.svg';
import './Header.scss';

const Header = ({ items, defaultPath, onLogout }) => {
    const { account, theme } = useContext(BackofficeContext);
    const logoRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        if (logoRef.current) {
            logoRef.current.focus();
        }
    }, [location.pathname]);

    return (
        <header role="banner" className={`Header ${theme.backgroundColor}`}>
            <div className="skip-link-group">
                <a href="#contents" className="skip-link sr-only sr-only-focusable">Accéder au contenu principal</a>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                            {account.profile === 'anonymous' ?
                                <a href="https://anotea.francetravail.fr">
                                    <img src={logo} ref={logoRef} className="logo" alt="Anotéa accueil" tabIndex="-1" />
                                </a> : <NavLink to={defaultPath}>
                                    <img src={logo} ref={logoRef} className="logo" alt="Anotéa accueil backoffice" tabIndex="-1" />
                                </NavLink>
                            }

                            {items}

                            {account.profile !== 'anonymous' &&
                                <button
                                    onClick={onLogout}
                                    className="logout btn btn-outline-light">
                                    <span>Se déconnecter</span>
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    items: PropTypes.node.isRequired,
    defaultPath: PropTypes.node.isRequired,
    onLogout: PropTypes.func,
    profile: PropTypes.string,
};

export default Header;
