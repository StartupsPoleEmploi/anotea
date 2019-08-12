import React from 'react';
import PropTypes from 'prop-types';
import './Stars.scss';

export default function Stars({ rate }) {

    let isDecimalsNumber = rate % 1 !== 0;
    let note = Math.round(rate);
    let stars = new Array(5).fill('active', 0, note).fill('empty', note, 5);

    return (
        <span>
            {
                stars.map((star, index) => {
                    let starClass = (isDecimalsNumber && Math.ceil(note) === index + 1 && index <= note) ? 'fa-star-half-alt' : 'fa-star';
                    return <span
                        key={index}
                        className={star === 'active' ? `stars fa ${starClass} active` : 'stars fa fa-star empty'}
                    />;
                })
            }
        </span>
    );
}

Stars.propTypes = { rate: PropTypes.number.isRequired };
