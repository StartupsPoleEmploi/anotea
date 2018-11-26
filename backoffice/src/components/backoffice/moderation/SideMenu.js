import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

export default class SideMenu extends React.PureComponent {

    state = {
        currentPage: 'moderation'
    }

    static propTypes = {
        onChangePage: PropTypes.func.isRequired,
        features: PropTypes.array.isRequired
    }

    changePage = page => {
        this.setState({ currentPage: page });
        this.props.onChangePage(page);
    }

    render() {
        return (
            <div className="sideMenu">
                {this.props.features &&
                    <div className="dropdown">
                        <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                            Menu
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button className={this.state.currentPage === 'moderation' ? 'active' : ''} onClick={this.changePage.bind(this, 'moderation')}>Modération des avis</button>
                            </li>
                            {this.props.features.includes('EDIT_ORGANISATIONS') &&
                                <li>
                                    <button className={this.state.currentPage === 'organisme' ? 'active' : ''} onClick={this.changePage.bind(this, 'organisme')}>Gestion des organismes</button>
                                </li>
                            }
                        </ul>
                    </div>
                }
            </div>
        );
    }
}
