import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Toolbar.scss';

export default class Toolbar extends React.Component {

    static propTypes = {
        parameters: PropTypes.object.isRequired,
        inventory: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            searchInputValue: this.props.parameters.query || '',
        };
    }

    createFilter = (filter, label, options = {}) => {
        let nbElements = _.get(this.props.inventory, filter);
        let searchMode = !!this.state.searchInputValue;
        let pastille = options.showPastille && !searchMode && nbElements > 0 ?
            <span className="badge badge-light pastille">{nbElements}</span> :
            <span />;

        let isActive = !searchMode && this.props.parameters.filter === filter;
        return (
            <li className={`nav-item ${searchMode && 'disabled'}`}>
                <a
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => this.props.onChange({ filter })}>
                    <span className="mr-1">{label} {pastille}</span>
                </a>
            </li>
        );
    };

    createSearchInput = () => {

        let submit = () => this.props.onChange({ filter: 'all', query: this.state.searchInputValue });

        return (
            <div className="d-flex align-items-center search">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <div className="input-group-text"><i className="fas fa-search" /></div>
                    </div>

                    <input
                        className="form-control"
                        type="search"
                        placeholder="..."
                        aria-label="Rechercher un avis..."
                        value={this.state.searchInputValue}
                        onKeyPress={e => {
                            if (e.key === 'Enter') {
                                submit();
                            }
                        }}
                        onChange={e => this.setState({ searchInputValue: e.target.value })} />

                    {
                        this.state.searchInputValue &&
                        <i
                            className="far fa-times-circle cancel"
                            onClick={() => {
                                this.setState({ searchInputValue: '' }, () => submit());
                            }} />
                    }

                </div>
                <button
                    className="btn"
                    type="search"
                    onClick={() => submit()}>Rechercher
                </button>
            </div>
        );
    };

    render() {
        return (
            <div className="Filters">
                <nav className="nav">
                    {this.createFilter('toModerate', 'À modérer', { showPastille: true })}
                    {this.createFilter('published', 'Publiés')}
                    {this.createFilter('rejected', 'Rejetés')}
                    {this.createFilter('reported', 'Signalés', { showPastille: true })}
                    {this.createFilter('all', 'Tous')}
                    <li className="nav-item">{this.createSearchInput()}</li>
                </nav>
            </div>
        );
    }
}
