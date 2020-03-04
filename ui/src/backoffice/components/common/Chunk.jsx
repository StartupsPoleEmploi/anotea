import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { log } from '../../utils/logger';

export const Chunk = ({ load, name }) => {

    log(`Loading chunk ${name || ''}`);
    return (
        <Suspense fallback={<div></div>}>
            {load()}
        </Suspense>
    );
};

Chunk.propTypes = {
    load: PropTypes.func.isRequired,
    name: PropTypes.string,
};

