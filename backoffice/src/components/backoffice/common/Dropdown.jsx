import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Dropdown.scss';

export const DropdownDivider = () => (<div className="dropdown-divider" />);

export const DropdownItem = props => {
    return (
        <a
            className={`dropdown-item ${props.className}`}
            {..._.omit(props, ['className', 'children'])}
        >
            {props.children}
        </a>
    );
};

DropdownItem.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};


export const Dropdown = ({ header, button, items, className }) => {

    return (
        <div className={`Dropdown ${className || ''}`}>
            {button}
            <div className="dropdown-menu dropdown-menu-right">
                <h6 className="dropdown-header">{header}</h6>
                {items}
            </div>
        </div>
    );
};

Dropdown.propTypes = {
    header: PropTypes.string.isRequired,
    button: PropTypes.node.isRequired,
    items: PropTypes.node.isRequired,
    color: PropTypes.string,
    className: PropTypes.string,
};

