import React from 'react';
import PropTypes from 'prop-types';
import './Toolbar.scss';

export { default as Tab } from './tabs/Tab';
export { default as SearchInputTab } from './SearchInputTab';
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
