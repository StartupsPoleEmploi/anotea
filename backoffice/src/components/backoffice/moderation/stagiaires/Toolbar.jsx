import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

export default class Toolbar extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        inventory: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            searchInputValue: this.props.query.stagiaire || '',
        };
    }

    createTab = (filter, label, options = {}) => {
        let nbElements = _.get(this.props.inventory, filter);
        let searchMode = !!this.state.searchInputValue;
        let pastille = options.showPastille && nbElements > 0 ?
            <span className="badge badge-light pastille">{nbElements}</span> :
            <span />;

        let isActive = !searchMode && this.props.query.filter === filter;
        return (
            <li className={`nav-item ${searchMode && 'disabled'} ${isActive ? 'active' : ''}`}>
                <a
                    className={`nav-link`}
                    onClick={() => this.props.onChange({ filter })}>
                    <span className="mr-1">{label} {pastille}</span>
                </a>
            </li>
        );
    };

    createSearchInput = () => {

        let submit = () => this.props.onChange({ filter: 'all', stagiaire: this.state.searchInputValue });

        return (
            <div className="d-flex align-items-center">
                <div className={`input-group ${this.state.searchInputValue ? 'active' : ''}`}>
                    <div className="input-group-prepend">
                        <div className="input-group-text"><i className="fas fa-search" /></div>
                    </div>

                    <input
                        className="form-control"
                        type="search"
                        placeholder="Rechercher un stagiaire..."
                        aria-label="Rechercher un stagiaire..."
                        value={this.state.searchInputValue}
                        onKeyPress={e => {
                            if (e.key === 'Enter') {
                                submit();
                            }
                        }}
                        onChange={e => this.setState({ searchInputValue: e.target.value })} />

                    {this.state.searchInputValue &&
                    <i
                        className="far fa-times-circle cancel"
                        onClick={() => {
                            this.setState({ searchInputValue: '' }, () => submit());
                        }} />
                    }

                </div>
                <button className={`btn ${this.state.searchInputValue ? 'active' : ''}`} type="search"
                        onClick={() => submit()}>
                    Rechercher
                </button>
            </div>
        );
    };

    render() {
        return (
            <nav className="nav">
                {this.createTab('toModerate', 'À modérer', { showPastille: true })}
                {this.createTab('published', 'Publiés')}
                {this.createTab('rejected', 'Rejetés')}
                {this.createTab('reported', 'Signalés', { showPastille: true })}
                {this.createTab('all', 'Tous')}
                <li className="nav-item nav-search">{this.createSearchInput()}</li>
            </nav>
        );
    }
}
