import React from 'react';
import PropTypes from 'prop-types';
import EmptyResults from './EmptyResults';
import ResultDivider from './ResultDivider';

const AvisResults = ({ results, renderAvis }) => {
    return (
        <div>
            {
                results.meta.pagination.totalItems === 0 ?
                    <EmptyResults /> :
                    results.avis.map(avis => {
                        return (
                            <div key={avis._id}>
                                {renderAvis(avis)}
                                <ResultDivider />
                            </div>
                        );
                    })
            }
        </div>
    );
};

AvisResults.propTypes = {
    results: PropTypes.object.isRequired,
    renderAvis: PropTypes.func.isRequired,
};

export default AvisResults;
