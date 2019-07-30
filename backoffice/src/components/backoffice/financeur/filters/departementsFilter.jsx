import React from 'react';
import PropTypes from 'prop-types';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import VirtualizedSelect from 'react-virtualized-select';

export default function DepartementsFilter({ departements, onChange, placeholderText }) {
    
    const options = departements.map(dep => ({
        label: dep,
        id: dep,
    }));

    return (
        <h2 className="subtitle">
            <div className="dropdown">
                <VirtualizedSelect
                    onChange={onChange}
                    options={options}
                    placeholder={placeholderText}
                />
            </div>
        </h2>
    );
}

DepartementsFilter.propTypes = {
    departements: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholderText: PropTypes.string.isRequired
};
