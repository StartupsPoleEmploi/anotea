import React from 'react';
import PropTypes from 'prop-types';
import './CarouselIndicator.scss';

const CarouselIndicator = ({ index, activeIndex, onClick }) => (
    <li>
        <a
            className={ index === activeIndex ?
                'carousel__indicator carousel__indicator--active' :
                'carousel__indicator' }
            onClick={onClick}
        />
    </li>
);

CarouselIndicator.propTypes = {
    index: PropTypes.number.isRequired,
    activeIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
};

export default CarouselIndicator;
