import React from 'react';
import PropTypes from 'prop-types';
import './Panel.scss';

const Panel = ({ header, toolbar, summary, results, pagination, className }) => {

    return (
        <div className={`Panel mb-0 ${className}`}>

            <div className="header">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-8">
                            {header}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="toolbar sticky-top">
                    {toolbar}
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

Panel.propTypes = {
    header: PropTypes.node,
    toolbar: PropTypes.node,
    summary: PropTypes.node,
    results: PropTypes.node,
    pagination: PropTypes.node,
    className: PropTypes.string,
};

export default Panel;
