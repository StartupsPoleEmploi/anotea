import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../../../../common/components/Loader';
import './Panel.scss';
import WithAnalytics from '../../../../../common/components/analytics/WithAnalytics';

const Panel = props => {

    return (
        <div className={`Panel ${props.className || ''} ${props.backgroundColor || ''}`} style={props.style || {}}>
            {props.filters &&
            <WithAnalytics category="filters">
                <div className="filters-holder">
                    <div className="container">
                        {props.filters}
                    </div>
                </div>
            </WithAnalytics>
            }

            {props.loading ?
                <Loader centered={true} /> :
                <div className="container">
                    <div className="summary-holder">
                        {props.summary}
                    </div>
                    {props.results}
                    <div className="pagination-holder">
                        {props.pagination}
                    </div>
                </div>
            }
        </div>
    );
};

Panel.propTypes = {
    filters: PropTypes.node,
    summary: PropTypes.node,
    results: PropTypes.node,
    pagination: PropTypes.node,
    loading: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    backgroundColor: PropTypes.string,
};

export default Panel;
