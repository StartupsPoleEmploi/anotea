import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import { NavLink, Route } from 'react-router-dom';
import logo from './Header.svg';

export default class Header extends React.Component {

    state = {};

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
        items: PropTypes.node.isRequired,
    };

    render() {
        const { items } = this.props;

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;

                return (
                    <div className={`Header ${isModeration ? 'blue' : 'misc'}`}>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <NavLink to="/admin">
                                            <img src={logo} className="logo" alt="logo" />
                                        </NavLink>

                                        {items}

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
