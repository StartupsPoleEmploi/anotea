import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = props => {

    let sizeClass = props.size;
    let colorClass = props.color ? props.color : '';
    let disabledClass = props.disabled ? 'disabled' : '';
    let toggableClass = props.toggable ? 'dropdown-toggle' : '';

    return (
        <button
            type="button"
            {..._.omit(props, ['size', 'color', 'toggable', 'className'])}
            {...(props.toggable ? { 'data-toggle': 'dropdown' } : {})}
            className={`Button ${sizeClass} ${colorClass} ${disabledClass} ${toggableClass} ${props.className || ''}`} />
    );
};

Button.propTypes = {
    size: PropTypes.string.isRequired,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    toggable: PropTypes.bool,
    className: PropTypes.string,
};

export default Button;
