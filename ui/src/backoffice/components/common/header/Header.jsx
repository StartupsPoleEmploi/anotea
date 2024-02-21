import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import BackofficeContext from '../../../BackofficeContext';
import logo from './logo.svg';
import './Header.scss';

const Header = ({ items, defaultPath, onLogout }) => {

    let { account, theme } = useContext(BackofficeContext);

    return (
        <div className={`Header ${theme.backgroundColor}`}>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                            <NavLink to={defaultPath}>
                                <img src={logo} className="logo" alt="Anotéa" />
                            </NavLink>

                            {items}

                            {account.profile !== 'anonymous' &&
                            <button
                                onClick={onLogout}
                                className="logout btn btn-outline-light">
                                <span>SE DECONNECTER</span>
                            </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Header.propTypes = {
    items: PropTypes.node.isRequired,
    defaultPath: PropTypes.node.isRequired,
    onLogout: PropTypes.func,
    profile: PropTypes.string,
};

export default Header;
