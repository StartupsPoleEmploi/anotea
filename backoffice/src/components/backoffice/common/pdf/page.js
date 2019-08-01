import React from 'react';

const Page = ({ children, singleMode, id }) => (
    <div id={id}
        className="bg-white shadow-1 center pa4"
        style={{ width: 'auto', height: singleMode ? 'auto' : '' }}
    >
        {children}
    </div>
);

export default Page;
