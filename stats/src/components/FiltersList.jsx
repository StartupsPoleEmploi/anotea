import React from 'react';
import './FiltersList.scss';
import Filter from './Filter'
import SearchButton from './SearchButton'

export default function FiltersList(props) {
    
    return (
        <div className="filters-list">
            <h1 className="title">Filtrer</h1>
            <div className="d-flex justify-content-around">
                <Filter />
                <SearchButton />
            </div>
        </div>
    );
}
