import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.scss';

export { default as Tab } from './Tab';
export const Tabs = ({ children }) => {

    return (
        <div className="Tabs row">
            <div className="col-sm-12 offset-md-1 col-md-10">
                <div className="tabs">
                    <nav className={`nav justify-content-center`}>
                        {children}
                    </nav>
                </div>
            </div>
        </div>
    );
};

Tabs.propTypes = {
    children: PropTypes.array.isRequired,
};
