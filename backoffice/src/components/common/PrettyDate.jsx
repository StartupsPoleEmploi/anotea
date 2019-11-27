import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const PrettyDate = ({ date, numeric }) => moment(date).format(numeric ? 'L' : 'LL');

PrettyDate.propTypes = {
    date: PropTypes.object.isRequired,
    numeric: PropTypes.bool,
};

export default PrettyDate;
