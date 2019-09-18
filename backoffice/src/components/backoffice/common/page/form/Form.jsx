import React from 'react';
import PropTypes from 'prop-types';
import './Form.scss';

export { default as Date } from './Date';
export { default as Select } from './Select';
export { default as Periode } from './Periode';

export const Form = ({ children }) => {

    return (
        <div className="Form">
            <form>
                {children}
            </form>
        </div>
    );
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
};
