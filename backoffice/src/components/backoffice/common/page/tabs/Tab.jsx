import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ label, isActive, onClick, isDisabled = () => false }) => {

    return (
        <li className={`Tab nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a className={`nav-link`} onClick={onClick}>
                <span>{label}</span>
            </a>
        </li>
    );
};
Tab.propTypes = {
    label: PropTypes.string.isRequired,
    isActive: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    isDisabled: PropTypes.func,
};

export default Tab;
