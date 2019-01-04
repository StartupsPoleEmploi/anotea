import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

const PrettyDate = ({ date, short }) => {
    return (
        <FormattedDate
            value={date}
            day="numeric"
            month={short ? 'numeric' : 'long'}
            year="numeric" />
    );
};
PrettyDate.propTypes = {
    date: PropTypes.object.isRequired,
    short: PropTypes.bool,
};

export default PrettyDate;
