import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import logo from './logo.svg';
import logoAnonymous from './logo-anonymous.png';
import logoPE from './pe.jpg';

import './Header.scss';


export default class Header extends React.Component {

    state = {
        menuOpen: false
    }

    toggleMenu = () =>{  this.setState({ menuOpen: !this.state.menuOpen }); }

    render() {
        return (
            <div className={`Header ${this.props.profile ? this.props.profile : 'anonymous'}`} onClick={this.toggleMenu}  >
                <div className="container" >
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                {this.props.profile !== 'anonymous' &&
                                    <>
                                        <NavLink to="/admin">
                                            <img src={logo} className="logo" alt="logo" />
                                        </NavLink>

                                        {this.props.loggedIn &&
                                            <>
                                                {this.props.items}

                                                <button
                                                    onClick={this.props.onLogout}
                                                    className="logout btn btn-outline-light">
                                                    <span>SE DECONNECTER</span>
                                                </button>
                                            </>
                                        }
                                    </>
                                }
                                {this.props.profile === 'anonymous' &&
                                    <>
                                        <div>
                                            <NavLink to="/admin">
                                                <img src={logoAnonymous} className="logo" alt="logo Anotéa" />
                                            </NavLink>
                                        </div>

                                        <div>
                                            <div className={`menu ${this.state.menuOpen ? 'open' : 'closed'}`} onMouseOver={() => this.toggleMenu()} onMouseOut={() => this.toggleMenu()}>
                                                <a href="#" className="unroll" alt="menu Financeurs"onClick={this.toggleMenu} >Nos services
                                                    <img className="icon-open" src="/static/images/home/chevron-down.svg" />
                                                    <img className="icon-close" src="/static/images/home/chevron-up.svg" />
                                                </a>
                                                <div className="content">
                                                    <ul>
                                                        <li>
                                                            <a href="/services/stagiaires" title="Demandeurd'emploi">Demandeur d'emploi</a>
                                                        </li>
                                                        <li>
                                                            <a href="/services/organismes" title="Organisme de formation">Organisme de formation</a>
                                                        </li>
                                                        <li>
                                                            <a href="/services/financeurs" title="Financeur">Financeur</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <img src={logoPE} className="logo-pe" alt="logo Pôle Emploi" />
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

Header.propTypes = {
    items: PropTypes.node.isRequired,
    onLogout: PropTypes.func,
    profile: PropTypes.string,
    loggedIn: PropTypes.bool
};

