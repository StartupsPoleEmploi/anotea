import React from 'react';
import './Filter.scss';
import DropDown from './DropDown'

export default class Filter extends React.PureComponent {

    render() {
        return (
            <div className="filter">
                <h2 className="title">Mois</h2>
                <DropDown />
            </div>
        );
    }
}