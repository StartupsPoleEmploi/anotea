import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import { NavLink } from 'react-router-dom';

const Header = ({ profile, items, logo, onLogout }) => {

    return (
        <div className={`Header ${profile || 'default'}`}>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                            <NavLink to="/admin">
                                <img src={logo} className="logo" alt="logo" />
                            </NavLink>

                            {items}

                            {profile &&
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
    logo: PropTypes.string.isRequired,
    onLogout: PropTypes.func,
    profile: PropTypes.string,
};

export default Header;
