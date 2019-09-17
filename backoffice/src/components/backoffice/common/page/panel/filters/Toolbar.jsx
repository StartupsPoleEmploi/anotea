import React from 'react';
import PropTypes from 'prop-types';
import './Toolbar.scss';

export { default as Filter } from './Filter';
export { default as SearchInputFilter } from './SearchInputFilter';
export const Toolbar = ({ children }) => {

    return (
        <div className="Toolbar row">
            <div className="col-sm-12 offset-md-1 col-md-10">
                <div className="bar nav-fill">
                    <nav className="nav">
                        {children}
                    </nav>
                </div>
            </div>
        </div>
    );
};

Toolbar.propTypes = {
    children: PropTypes.array.isRequired,
};
