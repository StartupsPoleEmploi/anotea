import React from 'react';
import PropTypes from 'prop-types';
import star from './Star.png';

const Star = props => {
    if (!props.svg) {
        return (<img src={star} className="star" alt="star" />);
    }
    return (<i className="star fas fa-star"></i>);
};

Star.propTypes = {
    svg: PropTypes.bool,
};
Star.defaultProps = {
    svg: true,
};

export default Star;
