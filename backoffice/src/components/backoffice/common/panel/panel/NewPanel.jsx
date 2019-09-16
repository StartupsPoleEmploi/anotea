import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../Loader';
import './NewPanel.scss';

const NewPanel = props => {

    return (
        <div className="NewPanel">
            {props.filters &&
            <div className={`filters`}>
                <div className="container">
                    {props.filters}
                </div>
            </div>
            }

            {props.loading ?
                <div className="d-flex justify-content-center"><Loader /></div> :
                <div className="container main">
                    <div>
                        <div className="summary">
                            {props.summary}
                        </div>
                        <div className="results">
                            {props.results}
                        </div>
                        <div className="a-pagination">
                            {props.pagination}
                        </div>
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
};

export default NewPanel;
