import React, { Component } from 'react';
import './DropDown.scss';

export default class DropDown extends Component {

    constructor() {
        super();

        this.state = {
            showMenu: false,
        };
    }

    showMenu = () => {

        if (!this.state.showMenu) {
            document.addEventListener('click', this.handleOutsideClick, false);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }

        this.setState(prevState => ({
            showMenu: !prevState.showMenu,
        }));
    };

    handleOutsideClick = e => {
        if (this.node.contains(e.target)) {
            return;
        }

        this.showMenu();
    };

    render() {

        return (
            <div className="dropdown">
                <button
                    className={(this.state.showMenu ? 'dropdown-button-down' : 'dropdown-button-up') + ' d-flex justify-content-between'}
                    onClick={this.showMenu}>
                    <span>Cumul depuis le début</span>
                    <i className={(this.state.showMenu ? 'fas fa-angle-up' : 'fas fa-angle-down') + ' caret'}></i>
                </button>

                {
                    this.state.showMenu ?
                        (
                            <div className="menu" ref={node => {
                                this.node = node;
                            }}>
                                {this.props.items.map((e, index) => (
                                    ((index + 1 === this.props.items.length) ?
                                        (<div key={index}>
                                            <button className="menu-button"><span>{e.intitule}</span></button>
                                        </div>) :
                                        (<div key={index}>
                                            <button className="menu-button"><span>{e.intitule}</span></button>
                                            <div className="dropdown-divider"></div>
                                        </div>)
                                    )
                                ))}
                            </div>
                        ) :
                        (
                            null
                        )
                }
            </div>
        );
    }
}
