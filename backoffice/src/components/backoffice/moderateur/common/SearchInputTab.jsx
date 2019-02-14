import React from 'react';
import PropTypes from 'prop-types';

export default class SearchInputTab extends React.Component {

    static propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.string,
        isActive: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            searchInputValue: this.props.value || '',
        };
    }

    render() {

        let submit = () => this.props.onSubmit(this.state.searchInputValue);

        return (
            <li className="SearchInputTab nav-item nav-search">
                <div className="d-flex align-items-center">
                    <div className={`input-group ${this.state.searchInputValue ? 'active' : ''}`}>
                        <div className="input-group-prepend">
                            <div className="input-group-text"><i className="fas fa-search" /></div>
                        </div>

                        <input
                            className="form-control"
                            type="search"
                            placeholder={this.props.label}
                            aria-label={this.props.label}
                            value={this.state.searchInputValue}
                            onChange={e => {
                                this.props.isActive(!!e.target.value);
                                return this.setState({ searchInputValue: e.target.value });
                            }}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    submit();
                                }
                            }} />

                        {this.state.searchInputValue &&
                        <i
                            className="far fa-times-circle cancel"
                            onClick={() => {
                                this.props.isActive(false);
                                this.setState({ searchInputValue: '' }, () => submit());
                            }} />
                        }

                    </div>
                    <button
                        className={`btn ${this.state.searchInputValue ? 'active' : ''}`}
                        type="search"
                        onClick={() => submit()}>
                        Rechercher
                    </button>
                </div>
            </li>
        );
    }
}
