/* global gtag */
/* global dataLayer */
import React from 'react';
import PropTypes from 'prop-types';

export default class ABTesting extends React.Component {

    static propTypes = {
        testName: PropTypes.string.isRequired,
        variantes: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            variante: null,
        };
    }

    componentDidMount() {
        dataLayer.push({ 'event': 'optimize.activate' });//In case of test using activation events
        gtag('event', 'optimize.callback', {
            callback: (variante = 0, testName) => {
                if (testName === this.props.testName) {
                    this.setState({ variante });
                }
            }
        });
    }

    render() {
        return (
            <div>
                {this.state.variante && this.props.variantes[this.state.variante]}
            </div>
        );
    }
}
