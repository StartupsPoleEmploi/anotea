import React from 'react';
import PropTypes from 'prop-types';
import './Library.scss';

const LargeButtons = ({ className }) => {
    return (
        <div>
            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className={`a-btn-large ${className}`}>
                            <i className="far fa-envelope a-icon" />
                            LARGE
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className={`a-btn-large a-btn-hover ${className}`}>
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className={`a-btn-large a-btn-disabled ${className}`}>
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown btn-group">
                            <button
                                type="button"
                                className={`a-btn-large dropdown-toggle ${className}`}
                                data-toggle="dropdown">DROPDOWN
                            </button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item a-text-red">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

LargeButtons.propTypes = {
    className: PropTypes.string,
};

const MediumButtons = ({ className }) => {
    return (
        <div className="row py-3">
            <div className="offset-2 col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-medium ${className}`}>
                        <i className="far fa-envelope a-icon" />
                        MEDIUM
                    </button>
                </div>
            </div>

            <div className="col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-medium a-btn-hover ${className}`}>
                        <i className="far fa-envelope a-icon" />
                        HOVER
                    </button>
                </div>
            </div>

            <div className="col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-medium a-btn-disabled ${className}`}>
                        <i className="far fa-envelope a-icon" />
                        DISABLED
                    </button>
                </div>
            </div>

            <div className="col-3">
                <div className="box d-flex justify-content-center">
                    <div className="a-dropdown btn-group">
                        <button
                            type="button"
                            className={`a-btn-medium dropdown-toggle ${className}`}
                            data-toggle="dropdown">
                            DROPDOWN
                        </button>
                        <div className="dropdown-menu">
                            <h6 className="dropdown-header">Header</h6>
                            <a className="dropdown-item">Item1</a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item a-text-red">Item2</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

MediumButtons.propTypes = {
    className: PropTypes.string,
};

const SmallButtons = ({ className }) => {
    return (
        <div className="row py-3">
            <div className="offset-2 col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-small ${className}`}>SMALL</button>
                </div>
            </div>

            <div className="col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-small a-btn-hover ${className}`}>HOVER</button>
                </div>
            </div>

            <div className="col-2">
                <div className="box d-flex justify-content-center">
                    <button type="button" className={`a-btn-small a-btn-disabled ${className}`}>DISABLED</button>
                </div>
            </div>

            <div className="col-3">
                <div className="box d-flex justify-content-center">
                    <div className="a-dropdown btn-group">
                        <button
                            type="button"
                            className={`a-btn-small dropdown-toggle ${className}`}
                            data-toggle="dropdown">DROPDOWN
                        </button>
                        <div className="dropdown-menu">
                            <h6 className="dropdown-header">Header</h6>
                            <a className="dropdown-item">Item1</a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item a-text-red">Item2</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

SmallButtons.propTypes = {
    className: PropTypes.string,
};


const Library = () => {

    return (
        <div className="Library anotea container">
            <div className="row justify-content-center">
                <div className="col-3">
                    <h1>COMPONENTS</h1>
                </div>
            </div>
            <div className="row py-3">
                <div className="offset-2 col-2">
                    <h3>BUTTONS</h3>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h5>BUTTONS LARGE - 1ST EMPHASIS</h5>
                </div>
            </div>

            <LargeButtons />
            <LargeButtons className="a-btn-red" />
            <LargeButtons className="a-btn-green" />
            <LargeButtons className="a-btn-blue" />

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h5>BUTTONS MEDIUM - 2ND EMPHASIS</h5>
                </div>
            </div>

            <MediumButtons />
            <MediumButtons className="a-btn-red" />
            <MediumButtons className="a-btn-green" />
            <MediumButtons className="a-btn-blue" />

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h5>BUTTONS SMALL - 3RD EMPHASIS</h5>
                </div>
            </div>

            <SmallButtons />
            <SmallButtons className="a-btn-red" />
            <SmallButtons className="a-btn-green" />
            <SmallButtons className="a-btn-blue" />

        </div>
    );
};

Library.propTypes = {};

export default Library;
