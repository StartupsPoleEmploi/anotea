import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = props => {

    let sizeClass = `a-btn-${props.size}`;
    let colorClass = props.color ? `a-btn-${props.color}` : '';
    let disabledClass = props.disabled ? 'a-btn-disabled' : '';
    let toggableClass = props.toggable ? 'dropdown-toggle' : '';
    let noop = () => ({});

    return (
        <button
            type={props.type || 'button'}
            style={props.style || {}}
            className={`Button ${sizeClass} ${colorClass} ${disabledClass} ${toggableClass} ${props.className || ''}`}
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
            <div className="tooltip-box">
                <div className="triangle"></div>
                <div className="message">{props.tooltip}</div>
            </div>
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
