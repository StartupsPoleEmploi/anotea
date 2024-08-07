import React from 'react';
import PropTypes from 'prop-types';
import './Pastille.scss';

const Pastille = props => {
    return <span className={`Pastille ${!props.value ? 'empty' : ''}`}>{props.value}<span className="sr-only">&nbsp;(à traiter)</span></span>;
};

Pastille.propTypes = {
    value: PropTypes.number,
};

export default Pastille;
