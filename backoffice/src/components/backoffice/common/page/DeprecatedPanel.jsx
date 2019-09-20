import React from 'react';
import PropTypes from 'prop-types';
import './DeprecatedPanel.scss';

const DeprecatedPanel = ({ header, filters, summary, results, pagination, className }) => {

    return (
        <div className={`DeprecatedPanel mb-0 ${className || ''}`}>

            {header &&
            <div className="header">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-8">
                            {header}
                        </div>
                    </div>
                </div>
            </div>
            }

            <div className="container">
                <div className="filters sticky-top">
                    {filters}
                </div>
                <div>
                    <div className="summary">
                        {summary}
                    </div>
                    <div className="results">
                        {results}
                    </div>
                    <div className="a-pagination">
                        {pagination}
                    </div>
                </div>
            </div>
        </div>
    );
};

DeprecatedPanel.propTypes = {
    header: PropTypes.node,
    filters: PropTypes.node,
    summary: PropTypes.node,
    results: PropTypes.node,
    pagination: PropTypes.node,
    className: PropTypes.string,
};

export default DeprecatedPanel;
