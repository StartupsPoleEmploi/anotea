import React from 'react';
import './Library.scss';

const Library = () => {

    return (
        <div className="Library anotea container">
            <div className="row justify-content-center">
                <div className="col-3">
                    <h1>Components</h1>
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

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h6>DEFAULT</h6>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large">
                            <i className="far fa-envelope a-icon" />
                            LARGE
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-hover">
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-disabled">
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-large btn-group">
                            <button type="button" className="dropdown-toggle" data-toggle="dropdown">DROPDOWN</button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h6>VARIANTES</h6>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-publish">
                            <i className="far fa-envelope a-icon" />
                            LARGE
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-publish a-btn-hover">
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-publish a-btn-disabled">
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-large btn-group">
                            <button type="button" className="a-btn-publish dropdown-toggle" data-toggle="dropdown">DROPDOWN</button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-reject">
                            <i className="far fa-envelope a-icon" />
                            LARGE
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-reject a-btn-hover">
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-reject a-btn-disabled">
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-large btn-group">
                            <button type="button" className="a-btn-reject dropdown-toggle" data-toggle="dropdown">DROPDOWN</button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-edit">
                            <i className="far fa-envelope a-icon" />
                            LARGE
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-edit a-btn-hover">
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-large a-btn-edit a-btn-disabled">
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-large btn-group">
                            <button type="button" className="a-btn-edit dropdown-toggle" data-toggle="dropdown">DROPDOWN</button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h5>BUTTONS MEDIUM - 2ND EMPHASIS</h5>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h6>DEFAULT</h6>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-medium">
                            <i className="far fa-envelope a-icon" />
                            MEDIUM
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-medium a-btn-hover">
                            <i className="far fa-envelope a-icon" />
                            HOVER
                        </button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-medium a-btn-disabled">
                            <i className="far fa-envelope a-icon" />
                            DISABLED
                        </button>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h5>BUTTONS SMALL - 3RD EMPHASIS</h5>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h6>DEFAULT</h6>
                </div>
            </div>

            <div className="row">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small">SMALL</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-hover">HOVER</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-disabled">DISABLED</button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-small btn-group">
                            <button type="button" className="dropdown-toggle" data-toggle="dropdown">DROPDOWN</button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-6">
                    <h6>VARIANTES</h6>
                </div>
            </div>

            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-cancel">SMALL</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-cancel a-btn-hover">HOVER</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-cancel a-btn-disabled">DISABLED</button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-small btn-group">
                            <button type="button" className="a-btn-cancel dropdown-toggle"
                                    data-toggle="dropdown">DROPDOWN
                            </button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-confirm">SMALL</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-confirm a-btn-hover">HOVER</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <button type="button" className="a-btn-small a-btn-confirm a-btn-disabled">DISABLED</button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <div className="a-dropdown-small btn-group">
                            <button type="button" className="dropdown-toggle a-btn-confirm"
                                    data-toggle="dropdown">DROPDOWN
                            </button>
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Header</h6>
                                <a className="dropdown-item">Item1</a>
                                <div className="dropdown-divider" />
                                <a className="dropdown-item">Item2</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

Library.propTypes = {};

export default Library;
