import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

export default class Star extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
        style: PropTypes.node
    };

    render() {
        return (
            <FontAwesomeIcon icon={faStar} size="1x" color={this.props.active ? '#F26930' : '#C8CBCE'}  />
        );
    }
}
