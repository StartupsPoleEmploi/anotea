import React from 'react';
import './FiltersList.scss';
import Filter from './Filter'

export default function FiltersList() {
    return (
        <div className="filters-list">
            <h1 className="title">Filtrer</h1>
            <Filter />
        </div>
    );
}