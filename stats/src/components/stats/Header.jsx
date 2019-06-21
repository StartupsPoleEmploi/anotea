import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import logo from '../../images/logo-anotea.png';

export default class Header extends Component {

    render() {

        return (
            <div className="Header">
                <div className="container">
                    <div className="row d-flex align-items-center">
                        <div className="col-sm-2">
                            <img className="logo" src={logo} alt="logo Anotea" />
                        </div>
                        <div className="col-sm-10">
                            <div className="d-flex justify-content-around">
                                <NavLink to="/stats/avis" className="nav-link" activeClassName="active">Avis</NavLink>
                                <NavLink to="/stats/organismes" className="nav-link" activeClassName="active">Organismes</NavLink>
                                <NavLink to="/stats/api" className="nav-link" activeClassName="active">Api</NavLink>
                                <NavLink to="/stats/divers" className="nav-link" activeClassName="active">Divers</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
