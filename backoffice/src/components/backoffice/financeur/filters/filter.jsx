import React from 'react';
import PropTypes from 'prop-types';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import VirtualizedSelect from 'react-virtualized-select';

export default function Filter({ options, onChange, placeholderText, selectValue }) {

    return (
        <h2 className="subtitle">
            <div className="dropdown">
                <VirtualizedSelect
                    onChange={onChange}
                    options={options}
                    placeholder={selectValue.label ? selectValue.label : placeholderText }
                    clearable
                    value={selectValue.label ? selectValue : placeholderText}
                />
            </div>
        </h2>
    );
}

Filter.propTypes = {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholderText: PropTypes.string.isRequired,
    selectValue: PropTypes.object.isRequired
};
