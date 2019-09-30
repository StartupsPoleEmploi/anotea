import React from 'react';
import PropTypes from 'prop-types';
import loader from './Loader.svg';

const Loader = props => {
    let image = <img src={loader} alt="loader" />;
    return props.centered ? <div className="d-flex justify-content-center">{image}</div> : image;
};

Loader.propTypes = {
    centered: PropTypes.bool,
};

export default Loader;
