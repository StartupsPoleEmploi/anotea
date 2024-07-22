import React from 'react';
import PropTypes from 'prop-types';
import './Filters.scss';

export { default as Filter } from './Filter';
export const Filters = ({ children }) => {

    return (
        <div className="Filters d-flex justify-content-center">
            <nav className="nav justify-content-center" aria-label="Type d'avis">
                {children}
            </nav>
        </div>
    );
};

Filters.propTypes = {
    children: PropTypes.array.isRequired,
};
