import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

export default class SideMenu extends React.PureComponent {

    propTypes = {
        onChangePage: PropTypes.func.isRequired
    }

    state = {
        currentPage: 'moderation'
    }

    changePage = page => {
        this.setState({ currentPage: page });
        this.props.onChangePage(page);
    }

    render() {
        return (
            <div className="sideMenu">
                <ul>
                    <li>
                        <a className={this.state.currentPage === 'moderation' ? 'active' : ''} onClick={this.changePage.bind(this, 'moderation')}>Modération des avis</a>
                    </li>
                    <li>
                        <a className={this.state.currentPage === 'organisme' ? 'active' : ''} onClick={this.changePage.bind(this, 'organisme')}>Gestion des organismes</a>
                    </li>
                </ul>
            </div>
        );
    }
}
