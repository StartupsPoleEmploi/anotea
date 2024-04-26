import React from 'react';
import PropTypes from 'prop-types';
import EmptyResults from './EmptyResults';
import ResultDivider from './ResultDivider';
import WithAnalytics from '../../../../../../common/components/analytics/WithAnalytics';
import './AvisResults.scss';

const AvisResults = ({ results, renderAvis }) => {
    return (
        <ul>
            {
                results.meta.pagination.totalItems === 0 ?
                    <EmptyResults /> :
                    results.avis.map((avis, index) => {
                        return (
                            <li className="no-list" key={avis._id} index={index}>
                                <WithAnalytics category="avis">
                                    {renderAvis(avis, index)}
                                    <ResultDivider />
                                </WithAnalytics>
                            </li>
                        );
                    })
            }
        </ul>
    );
};

AvisResults.propTypes = {
    results: PropTypes.object.isRequired,
    renderAvis: PropTypes.func.isRequired,
};

export default AvisResults;
