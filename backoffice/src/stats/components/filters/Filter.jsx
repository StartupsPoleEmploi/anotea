import React from 'react';
import PropTypes from 'prop-types';
import './Filter.scss';
import DropDown from './DropDown';

export default class Filter extends React.PureComponent {

    static propTypes = {
        items: PropTypes.object.isRequired,
        intitule: PropTypes.string.isRequired
    };

    render() {

        return (
            <div className="filter">
                <h2 className="title">{this.props.intitule}</h2>
                <DropDown items={this.props.items} />
            </div>
        );
    }
}
