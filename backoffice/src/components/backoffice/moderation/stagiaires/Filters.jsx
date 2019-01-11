import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './Filters.scss';

export default class Filters extends React.Component {

    static propTypes = {
        current: PropTypes.string.isRequired,
        inventory: PropTypes.object.isRequired,
    };

    createFilters = (filter, label, options = {}) => {
        let total = options.total ? (<span>({options.total})</span>) : <span />;
        return (
            <li className="nav-item">
                <NavLink
                    className="nav-link"
                    activeClassName={this.props.current === filter ? 'active' : ''}
                    to={`/admin/moderation/stagiaires/${filter}`}>
                    <span className="mr-1">{label} {total}</span>
                </NavLink>
            </li>
        );
    };

    render() {
        return (
            <div className="Filters">
                <nav className="nav">
                    {this.createFilters('toModerate', 'À modérer', { total: _.get(this.props.inventory, 'toModerate') })}
                    {this.createFilters('published', 'Publiés')}
                    {this.createFilters('rejected', 'Rejetés')}
                    {this.createFilters('reported', 'Signalés')}
                    {this.createFilters('all', 'Tous')}
                </nav>
            </div>
        );
    }
}
