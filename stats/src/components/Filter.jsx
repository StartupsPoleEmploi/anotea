import React from 'react';
import './Filter.scss';
import DropDown from './DropDown';

export default class Filter extends React.PureComponent {

    render() {

        return (
            <div className="filter">
                <h2 className="title">{this.props.intitule}</h2>
                <DropDown items={this.props.items} />
            </div>
        );
    }
}
