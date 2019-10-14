import React from 'react';
import PropTypes from 'prop-types';
import './Form.scss';

export { default as Date } from './Date';
export { default as Select } from './Select';
export { default as Periode } from './Periode';

export const Form = props => {

    return (
        <div className={`Form ${props.className || ''}`}>
            <form>
                {props.children}
            </form>
        </div>
    );
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
