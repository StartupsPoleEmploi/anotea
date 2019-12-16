import React from 'react';
import PropTypes from 'prop-types';
import './Filter.scss';
import Pastille from '../../../Pastille';

const Filter = ({ label, isActive, onClick, getNbElements = () => -1, isDisabled = () => false }) => {

    return (
        <li className={`Filter nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a
                href="/#"
                className={`nav-link`}
                onClick={e => {
                    e.preventDefault();
                    onClick(e);
                }}
            >
                <div className="Pastille--holder">
                    {label}
                    {getNbElements() > 0 ? <Pastille value={getNbElements()} /> : <span />}
                </div>
            </a>
        </li>
    );
};
Filter.propTypes = {
    label: PropTypes.string.isRequired,
    isActive: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    getNbElements: PropTypes.func,
    isDisabled: PropTypes.func,
};

export default Filter;
