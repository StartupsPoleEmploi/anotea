/* global ga */
import React from 'react';

let isEnabled;

//from https://github.com/DavidWells/analytics/blob/ba4dd1054fd64b887c64fdefb8e51f91fdc86f05/examples/react/src/utils/routeChanges.js
const onRouteChanged = callback => {

    const { addEventListener, history, location } = window;

    // Observe native navigation
    addEventListener('popstate', () => callback(location.pathname));

    // Observe manual navigation
    ['push', 'replace'].forEach(type => {
        const state = `${type}State`;
        const historyState = history[state];
        history[state] = function() {
            callback(arguments[2]);
            return historyState.apply(history, arguments);
        };
    });
};

export const initializeWidget = (trackingId, options = {}) => {
    return;
};

export const initialize = () => {
    onRouteChanged(url => {
        return;
    });
};

export const createAnalytics = category => {
    return {
        category,
        trackClick: action => {
            return;
        }
    };
};

const context = React.createContext(createAnalytics('anotea'));
export default context;
