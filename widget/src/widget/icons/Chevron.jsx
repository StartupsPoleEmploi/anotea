import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

export default class Chevron extends React.Component {

    static propTypes = {
        direction: PropTypes.string.isRequired
    };

    render() {
        return (
            <FontAwesomeIcon icon={this.props.direction === 'left' ? faChevronLeft : faChevronRight} size="1x" />
        );
    }
}
