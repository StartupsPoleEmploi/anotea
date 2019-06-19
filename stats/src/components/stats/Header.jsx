import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import logo from '../../images/logo-anotea.png'

export default class Header extends Component {

    constructor(props) {
        super(props);

        this.view = this.props.view;
    }

    render() {

        return (
            <div className="Header">
                <img className="logo" src={logo} alt="logo Anotea" />
                <div className="title d-flex justify-content-around">
                    <NavLink to="/stats/avis" className="avis-title" activeClassName="active">
                        Avis
                    </NavLink>
                    <NavLink to="/stats/organismes" className="organismes-title" activeClassName="active">
                        Organismes
                    </NavLink>
                </div>
            </div>
        );
    }
}
