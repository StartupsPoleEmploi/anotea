import React from 'react';
import PropTypes from 'prop-types';
import AnalyticsContext from '../../../analytics/AnalyticsContext';
import './Tab.scss';

const Tab = ({ label, isActive, onClick, isDisabled = () => false }) => {

    let { trackClick } = React.useContext(AnalyticsContext);

    return (
        <li className={`Tab nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a href="/#" className={`nav-link`} onClick={e => {
                e.preventDefault();
                trackClick(label);
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
