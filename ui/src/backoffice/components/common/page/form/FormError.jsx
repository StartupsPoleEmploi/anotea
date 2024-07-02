import React from 'react';
import PropTypes from 'prop-types';
import './FormError.scss';

export default class FormError extends React.Component {

    static propTypes = {
        children: PropTypes.node,
    };

    render() {
        let { children } = this.props;

        return (
            <p className="FormError">
                {children}
            </p>
        );
    }
}
