import React from 'react';
import PropTypes from 'prop-types';
import './FiltersList.scss';
import Filter from './Filter';
import SearchButton from './SearchButton';

export default function FiltersList(props) {

    FiltersList.propTypes = {
        variant: PropTypes.object.isRequired,
    };

    return (
        <div className="filters-list">
            <h1 className="title">Filtrer</h1>
            <div className="d-flex justify-content-around">
                {props.variant.map((e, index) => (
                    <Filter key={index} intitule={e.intitule} items={e.items} />
                ))}
                <SearchButton />
            </div>
        </div>
    );
}
