import React from 'react';
import PropTypes from 'prop-types';
import './CarouselSlide.scss';

const CarouselSlide = ({ index, activeIndex, slide }) => (

    <li
        className={index === activeIndex ?
            'carousel__slide carousel__slide--active' :
            'carousel__slide'}
    >
        <p>
            <strong className="carousel-slide__content">{slide.content}</strong></p>

        <img className="carousel-slide__img" src={slide.image} />

    </li>
);

CarouselSlide.propTypes = {
    index: PropTypes.number.isRequired,
    activeIndex: PropTypes.number.isRequired,
    slide: PropTypes.object.isRequired
};

export default CarouselSlide;
