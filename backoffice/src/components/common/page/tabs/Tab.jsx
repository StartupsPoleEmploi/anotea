import React from 'react';
import PropTypes from 'prop-types';
import './Tab.scss';

const Tab = ({ label, isActive, onClick, isDisabled = () => false }) => {

    return (
        <li className={`Tab nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a href="/#" className={`nav-link`} onClick={e => {
                e.preventDefault();
                onClick(e);
            }}>
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
