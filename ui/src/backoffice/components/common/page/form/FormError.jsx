import React from 'react';
import PropTypes from 'prop-types';
import './FormError.scss';

export default class FormError extends React.Component {

    static propTypes = {
        children: PropTypes.node,
        id: PropTypes.string,
    };

    render() {
        let { children, id } = this.props;

        return (
            <p className="FormError" id={id}>
                {children}
            </p>
        );
    }
}
