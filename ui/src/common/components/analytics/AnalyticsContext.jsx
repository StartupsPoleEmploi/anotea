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

    isEnabled = !!trackingId;
    console.log(`GoogleAnalytics enabled=${isEnabled}`);

    if (!isEnabled) {
        return;
    }

    /* eslint-disable */
    // @formatter:off
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script',`https://www.google-analytics.com/analytics${options.debug ? '_debug':''}.js`,'ga');
    // @formatter:on
    /* eslint-enable */

    ga('create', trackingId, 'auto');

    if (options.debug) {
        ga('set', 'sendHitTask', null);
        //window.ga_debug = { trace: true };
    }

    onRouteChanged(url => {
        let baseUrl = url.indexOf('?') === -1 ? url : url.split('?')[0];
        ga('set', 'page', baseUrl);
        ga('send', 'pageview');
    });
};

export const initialize = () => {
    onRouteChanged(url => {
        if(window.ga) {
            let baseUrl = url.indexOf('?') === -1 ? url : url.split('?')[0];
            ga('set', 'page', baseUrl);
            ga('send', 'pageview');
        }
    });
};

export const createAnalytics = category => {
    return {
        category,
        trackClick: action => {

            if (!isEnabled) {
                return;
            }

            if(window.ga) {
                ga('send', 'event', {
                    hitType: 'event',
                    eventCategory: category,
                    eventAction: action,
                });
            }
        }
    };
};

const context = React.createContext(createAnalytics('anotea'));
export default context;
