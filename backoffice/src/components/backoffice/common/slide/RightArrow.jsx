import React from 'react';
import PropTypes from 'prop-types';
import './Arrow.scss';

const RightArrow = ({ onClick }) => (
    <a
        href="#"
        className="carousel__arrow carousel__arrow--right"
        onClick={onClick}
    >
        <span className="fa fa-2x fa-angle-right" />
    </a>
);

RightArrow.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default RightArrow;
