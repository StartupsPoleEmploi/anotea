import React from 'react';
import PropTypes from 'prop-types';
import './Panel.scss';

const Panel = ({ className, header, toolbar, results }) => {

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
                    {toolbar &&
                    <div className="toolbar sticky-top nav-fill">{toolbar}</div>
                    }
                    <div className="results pt-4">
                        {results}
                    </div>
                </div>
            </div>
        </div>
    );
};

Panel.propTypes = {
    header: PropTypes.object.isRequired,
    toolbar: PropTypes.object.isRequired,
    results: PropTypes.object.isRequired,
    className: PropTypes.string,
};

export default Panel;
