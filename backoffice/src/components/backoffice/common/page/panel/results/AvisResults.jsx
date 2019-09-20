import React from 'react';
import PropTypes from 'prop-types';
import GlobalMessage from '../../../message/GlobalMessage';
import EmptyResults from './EmptyResults';
import ResultDivider from './ResultDivider';

const AvisResults = ({ results, message, renderAvis }) => {
    return (
        <div>
            {message &&
            <GlobalMessage
                message={message}
                onClose={() => this.setState({ message: null })} />
            }
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
    message: PropTypes.object,
};

export default AvisResults;
