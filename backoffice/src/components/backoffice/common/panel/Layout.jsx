import React from 'react';
import PropTypes from 'prop-types';
import './Layout.scss';

const Layout = ({ header, form, tabs, filters, summary, results, pagination, className, type }) => {

    return (
        <div className={`Layout mb-0 ${className || ''}`}>

            {header &&
            <div className={`header a-${type}`}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-8">
                            {header}
                        </div>
                    </div>
                </div>
            </div>
            }

            <div className={`form a-${type}`}>
                <div className="container">
                    <div className="form-holder">
                        {form}
                    </div>
                </div>
            </div>

            <div className={`tabs a-${type}`}>
                <div className="container">
                    {tabs}
                </div>
            </div>

            {filters &&
            <div className={`filters`}>
                <div className="container">
                    {filters}
                </div>
            </div>}

            <div className={`container main`}>
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

Layout.propTypes = {
    header: PropTypes.node,
    form: PropTypes.node,
    filters: PropTypes.node,
    tabs: PropTypes.node,
    summary: PropTypes.node,
    results: PropTypes.node,
    pagination: PropTypes.node,
    className: PropTypes.string,
    type: PropTypes.string,
};

export default Layout;
