import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../Loader';
import './NewPanel.scss';

const NewPanel = props => {

    return (
        <div className={`NewPanel ${props.className || ''} ${props.backgroundColor || ''}`}>
            {props.filters &&
            <div className="filters-holder">
                <div className="container">
                    {props.filters}
                </div>
            </div>
            }

            {props.loading ?
                <div className="d-flex justify-content-center"><Loader /></div> :
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

NewPanel.propTypes = {
    filters: PropTypes.node,
    summary: PropTypes.node,
    results: PropTypes.node,
    pagination: PropTypes.node,
    loading: PropTypes.bool,
    className: PropTypes.string,
    backgroundColor: PropTypes.string,
};

export default NewPanel;
