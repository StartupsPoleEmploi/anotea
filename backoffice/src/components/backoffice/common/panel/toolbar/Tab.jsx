import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ label, isActive, onClick, getNbElements = () => -1, isDisabled = () => false }) => {

    return (
        <li className={`Tab nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a
                className={`nav-link`}
                onClick={onClick}>
                <span>
                    {label}
                    {getNbElements() > 0 ?
                        <span className="badge badge-light pastille">{getNbElements()}</span> :
                        <span />
                    }
                </span>
            </a>
        </li>
    );
};
Tab.propTypes = {
    label: PropTypes.string.isRequired,
    isActive: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    getNbElements: PropTypes.func,
    isDisabled: PropTypes.func,
};

export default Tab;
