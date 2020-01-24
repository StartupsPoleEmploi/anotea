import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const PrettyDate = ({ date, format, transform = v => v }) => {
    let value = moment(date).format(format || 'LL');
    return (<span>{transform(value)}</span>);
};

PrettyDate.propTypes = {
    date: PropTypes.object.isRequired,
    format: PropTypes.string,
    transform: PropTypes.func,
};

export default PrettyDate;
