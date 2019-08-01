import React from 'react';
import PropTypes from 'prop-types';

const Page = ({ children, singleMode, id }) => (
    <div id={id}
        className="bg-white shadow-1 center pa4"
        style={{ width: 'auto', height: singleMode ? 'auto' : '' }}
    >
        {children}
    </div>
);

Page.propTypes = {
    children: PropTypes.array.isRequired,
    singleMode: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
};

export default Page;
