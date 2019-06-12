import React, { Component } from 'react';
import './Header.scss';
import logo from './images/logo-anotea.png'

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
                    <span className={(this.props.isAvis ? "active " : "") + "avis-title"}
                          onClick={this.view}>Avis</span>
                    <span className={(this.props.isOrganismes ? "active " : "") + "organismes-title"}
                          onClick={this.view}>Organismes</span>
                </div>
            </div>
        );
    }
}
