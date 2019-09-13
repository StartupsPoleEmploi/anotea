import React from 'react';
import PropTypes from 'prop-types';
import GlobalMessage from '../../message/GlobalMessage';
import NoResults from './NoResults';
import Avis from '../../avis/Avis';
import ResultDivider from './ResultDivider';

const AvisResults = ({ results, message }) => {
    return (
        <div>
            {message &&
            <GlobalMessage
                message={message}
                onClose={() => this.setState({ message: null })} />
            }
            {
                results.meta.pagination.totalItems === 0 ?
                    <NoResults /> :
                    results.avis.map(avis => {
                        return (
                            <div key={avis._id}>
                                <Avis avis={avis} readonly={true} showStatus={true} onChange={() => ({})} />
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
    message: PropTypes.object,
};

export default AvisResults;
