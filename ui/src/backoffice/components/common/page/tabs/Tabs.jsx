import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.scss';

export { default as Tab } from './Tab';
export const Tabs = ({ children }) => {
    return (
        <div className="Tabs d-flex justify-content-center">
            <nav className="nav justify-content-center">
                {children}
            </nav>
        </div>
    );
};

Tabs.propTypes = {
    children: PropTypes.node.isRequired,
};
