import React from 'react';
import PropTypes from 'prop-types';
import OptionsContext from './OptionsContext';

let Option = ({ value, render }) => {
    return (
        <OptionsContext.Consumer>
            {options => {
                let option = options.find(o => o === value);
                if (!option) {
                    return (<div></div>);
                }

                return render(options);
            }}
        </OptionsContext.Consumer>
    );
};

Option.propTypes = {
    value: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
};

export default Option;
