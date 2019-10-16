import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Button.scss';
import Tooltip from './Tooltip';

const Button = props => {

    let sizeClass = `a-btn-${props.size}`;
    let colorClass = props.color ? `a-btn-${props.color}` : '';
    let disabledClass = props.disabled ? 'a-btn-disabled' : '';
    let toggableClass = props.toggable ? 'dropdown-toggle' : '';
    let tooltipClass = props.tooltip ? 'Tooltip--holder' : '';
    let classes = `${sizeClass} ${colorClass} ${disabledClass} ${toggableClass} ${tooltipClass} ${props.className || ''}`;
    let noop = () => ({});

    return (
        <button
            type={props.type || 'button'}
            style={props.style || {}}
            className={`Button ${classes}`}
            {...(props.toggable ? { 'data-toggle': 'dropdown' } : {})}
            {..._.omit(props, ['size', 'color', 'toggable', 'className', 'onClick'])}
            onClick={!props.onClick ? noop : e => {
                props.onClick(e);
                if (props.type === 'submit') {
                    e.preventDefault();
                }
            }}
        >
            {props.tooltip &&
            <Tooltip value={props.tooltip} />
            }
            {props.children}
        </button>
    );
};

Button.propTypes = {
    size: PropTypes.string.isRequired,
    color: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    toggable: PropTypes.bool,
    style: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string,
    tooltip: PropTypes.string,
    children: PropTypes.node,
};

export default Button;
