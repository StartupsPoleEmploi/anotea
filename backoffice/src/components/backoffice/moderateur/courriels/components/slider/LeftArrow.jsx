import React from 'react';
import PropTypes from 'prop-types';
import './Arrow.scss';

const LeftArrow = ({ onClick }) => (
    <a
        href="#"
        className="carousel__arrow carousel__arrow--left"
        onClick={onClick}
    >
        <span className="fa fa-2x fa-angle-left" />
    </a>
);

LeftArrow.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default LeftArrow;
