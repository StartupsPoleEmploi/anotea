import React, { Component } from 'react';
import './DropDown.scss'

export default class DropDown extends Component {
    
    constructor() {
        super();
        
        this.state = {
            showMenu: false,
        }
    }

    showMenu = (event) => {
        event.preventDefault();
        
        this.setState({
            showMenu: !this.state.showMenu,
        });
    }

    render() {
        
        return (
            <div className="dropdown">
                <button className="dropdown-button d-flex justify-content-between" onClick={this.showMenu}>
                    <span>Cumul depuis le début</span>
                    <i className={(this.state.showMenu ? 'fas fa-angle-up' : 'fas fa-angle-down') + ' caret'}></i>
                </button>
                
                {
                    this.state.showMenu
                        ? (
                            <div className="menu">
                                {this.props.items.map( (e, index) => (
                                    <div key={index}>
                                        <button className="menu-button"> <span>{e.intitule}</span> </button>
                                        <div className="dropdown-divider"></div>
                                    </div>
                                ))}
                            </div>
                        )
                        : (
                            null
                        )
                    }
            </div>
        );
    }
}
