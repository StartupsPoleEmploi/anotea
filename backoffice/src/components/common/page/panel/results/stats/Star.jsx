import React from 'react';
import PropTypes from 'prop-types';
import star from './Star.png';

const Star = props => {
    if (props.printable) {
        return (<img src={star} className="star" alt="star" />);
    }
    return (<i className="star fas fa-star"></i>);
};

Star.propTypes = {
    printable: PropTypes.bool,
};

export default Star;
