import React from 'react';
import loader from './Loader.svg';
import './Loader.scss'

export default function Loader() {
    return (
        <img src={loader} alt="loader" className="loading" />
    );
}
