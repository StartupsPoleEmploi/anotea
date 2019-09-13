import React from 'react';
import PropTypes from 'prop-types';
import './Form.scss';

export { default as Date } from './Date';
export { default as Select } from './Select';
export { default as DateRange } from './DateRange';
export const Form = ({ children }) => {

    return (
        <form className="Form">
            {children}
        </form>
    );
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
};
