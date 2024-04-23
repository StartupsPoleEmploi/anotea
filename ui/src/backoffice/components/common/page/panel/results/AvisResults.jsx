import React from 'react';
import PropTypes from 'prop-types';
import EmptyResults from './EmptyResults';
import ResultDivider from './ResultDivider';
import WithAnalytics from '../../../../../../common/components/analytics/WithAnalytics';

const AvisResults = ({ results, renderAvis }) => {
    return (
        <div>
            {
                results.meta.pagination.totalItems === 0 ?
                    <EmptyResults /> :
                    results.avis.map((avis, index) => {
                        return (
                            <div key={avis._id} index={index}>
                                <WithAnalytics category="avis">
                                    {renderAvis(avis, index)}
                                    <ResultDivider />
                                </WithAnalytics>
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
