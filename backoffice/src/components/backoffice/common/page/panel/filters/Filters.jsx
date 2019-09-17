import React from 'react';
import PropTypes from 'prop-types';
import './Filters.scss';

export { default as Filter } from './Filter';
export const Filters = ({ children }) => {

    return (
        <div className="Filters row">
            <div className="col-sm-12 offset-md-1 col-md-10">
                <nav className="nav justify-content-center">
                    {children}
                </nav>
            </div>
        </div>
    );
};

Filters.propTypes = {
    children: PropTypes.array.isRequired,
};
