/* global gtag */
import React from 'react';
import ABTesting from '../common/ABTesting';

export default class FakeButtonsABTest extends React.Component {

    sendSuccess(label) {
        gtag('event', 'click-button', {
            'event_category': 'abtesting',
            'event_label': label,
            'value': 1,
        });
    }

    getVariante0() {
        return (<button onClick={() => this.sendSuccess('A')}>A</button>);
    }

    getVariante1() {
        return (<button onClick={this.sendSuccess('B')}>B</button>);
    }

    render() {
        return (<ABTesting testName="8Kv-n0cHQQaTcz-fZWNu1w" variantes={[this.getVariante0(), this.getVariante1()]} />);
    }
}
