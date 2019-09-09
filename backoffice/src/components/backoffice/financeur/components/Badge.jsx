import React from 'react';
import PropTypes from 'prop-types';
import './Badge.scss';

const truncate = (input, max) => input.length > max ? `${input.substring(0, max)}...` : input;

const Badge = props => {

    let className = `${props.className || ''}`;
    let color = `${props.color || ''}`;
    let maxLength = 20;
    let showTooltip = props.text.length > maxLength;

    return (
        <div className={`Badge ${className} ${color} ${showTooltip ? 'with-pointer' : ''}`}>
            {truncate(props.text, maxLength)}
            {showTooltip && <span className="badge-tooltip">{props.text}</span>}
        </div>
    );
};

Badge.propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
    color: PropTypes.string,
};

export default Badge;
