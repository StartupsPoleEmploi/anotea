/* global gtag */
/* global dataLayer */
import React from 'react';
import PropTypes from 'prop-types';

export default class ABTest extends React.Component {

    static propTypes = {
        experimentId: PropTypes.string.isRequired,
        render: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            variante: 0,
        };
    }

    componentDidMount() {
        dataLayer.push({ 'event': 'optimize.activate' });//In case of test using activation events
        gtag('event', 'optimize.callback', {
            callback: (variante = 0, testName) => {
                if (testName === this.props.experimentId) {
                    this.setState({ variante });
                }
            }
        });
    }

    sendEvent(action) {
        gtag('event', action, {
            'event_category': 'abtesting',
            'event_label': this.state.variante,
        });
        return true;
    }

    render() {
        return this.props.render(this.state.variante, this.sendEvent);
    }
}
