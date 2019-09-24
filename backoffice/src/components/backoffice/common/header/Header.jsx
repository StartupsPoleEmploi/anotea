import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import UserContext from '../../../UserContext';

import './Header.scss';

const Header = ({ items, logo, onLogout }) => {

    let user = useContext(UserContext);
    let profile = user.profile;

    return (
        <div className={`Header ${profile}`}>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                            <NavLink to="/admin">
                                <img src={logo} className="logo" alt="logo" />
                            </NavLink>

                            {items}

                            {profile !== 'anonymous' &&
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
