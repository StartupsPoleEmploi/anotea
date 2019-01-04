import React from 'react';
import PropTypes from 'prop-types';
import './Panel.scss';

const Panel = ({ className, header, filters, results }) => {

    return (
        <div className={`Panel ${className || ''} mb-0`}>
            <div className="header pb-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-8">
                            {header}
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="container">
                    <div className="sticky-top row justify-content-center">
                        <div className="col-8 d-flex justify-content-center">
                            <div className="filters">
                                {filters}
                            </div>
                        </div>
                    </div>
                    <div className="results pt-4">
                        {results}
                    </div>
                </div>
            </div>
        </div>
    );
};

Panel.propTypes = {
    header: PropTypes.array.isRequired,
    filters: PropTypes.array.isRequired,
    results: PropTypes.array.isRequired,
    className: PropTypes.string,
};

export default Panel;
