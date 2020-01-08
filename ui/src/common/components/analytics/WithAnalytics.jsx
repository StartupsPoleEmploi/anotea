import React from 'react';
import PropTypes from 'prop-types';
import AnalyticsContext, { createAnalytics } from './AnalyticsContext';

const WithAnalytics = ({ category, children }) => {

    let parent = React.useContext(AnalyticsContext);

    if (!category) {
        return children;
    }

    return (
        <AnalyticsContext.Provider value={createAnalytics(`${parent.category}/${category}`)}>
            {children}
        </AnalyticsContext.Provider>
    );
};

WithAnalytics.propTypes = {
    category: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default WithAnalytics;


