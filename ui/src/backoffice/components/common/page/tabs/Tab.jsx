import React from 'react';
import PropTypes from 'prop-types';
import AnalyticsContext from '../../../../../common/components/analytics/AnalyticsContext';
import './Tab.scss';

const Tab = ({ label, isActive, onClick, isDisabled = () => false }) => {

    let { trackClick } = React.useContext(AnalyticsContext);

    return (
        <li className={`Tab nav-item ${isActive() ? 'active' : ''} ${isDisabled() ? 'disabled' : ''}`}>
            <a href="/#" className={`nav-link ${isActive() ? 'active' : ''}`} onClick={e => {
                    e.preventDefault();
                    trackClick(label);
                    onClick(e);
                }}
                aria-current={isActive() ? 'true' : 'false'}>
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
