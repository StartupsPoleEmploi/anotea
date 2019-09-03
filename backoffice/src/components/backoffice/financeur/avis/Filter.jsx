import React from 'react';
import PropTypes from 'prop-types';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import VirtualizedSelect from 'react-virtualized-select';

const optionStyles = {
    'width': '260px',
    'height': '46px',
    'marginBottom': '8px',
    'backgroundColor': '#F4F4F5',
    'border': 'none',
    'borderRadius': '5px',

};
const titleStyle = {
    'padding': '0px',
    'margin': '0px',
    'color': '#24303A',
    'fontFamily': 'Lato',
    'fontSize': '18px',
    'fontWeight': 'bold',
    'lineHeight': '22px',
};

export default function Filter({ label, options, onChange, placeholderText, selectValue }) {
    return (
        <div>
            <p style={titleStyle}>{label}</p>
            <VirtualizedSelect
                optionHeight={50}
                style={optionStyles}
                onChange={onChange}
                options={options}
                placeholder={placeholderText}
                clearable
                value={Object.entries(selectValue).length !== 0 ? selectValue : placeholderText}
            />
        </div>
    );
}

Filter.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholderText: PropTypes.string.isRequired,
    selectValue: PropTypes.object.isRequired
};
