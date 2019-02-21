import React from 'react';
import PropTypes from 'prop-types';
import './LibraryPanel.scss';
import Button from './backoffice/common/Button';
import Panel from './backoffice/common/panel/Panel';
import { Dropdown, DropdownDivider, DropdownItem } from './backoffice/common/Dropdown';

const ButtonShowcase = ({ size, color }) => {
    return (
        <div>
            <div className="row py-3">
                <div className="offset-2 col-2">
                    <div className="box d-flex justify-content-center">
                        <Button size={size} color={color}>
                            <i className="far fa-envelope a-icon" /> LARGE
                        </Button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <Button size={size} color={color} className="a-btn-hover">
                            <i className="far fa-envelope a-icon" /> HOVER
                        </Button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="box d-flex justify-content-center">
                        <Button size={size} color={color} disabled={true}>
                            <i className="far fa-envelope a-icon" /> DISABLED
                        </Button>
                    </div>
                </div>

                <div className="col-3">
                    <div className="box d-flex justify-content-center">
                        <Dropdown
                            header="Header"
                            button={
                                <Button size={size} color={color} toggable={true}>
                                    <i className="far fa-envelope a-icon" /> DROPDOWN
                                </Button>
                            }
                            items={
                                <div>
                                    <DropdownItem>Item 1</DropdownItem>
                                    <DropdownDivider />
                                    <DropdownItem className="a-text-important">
                                        <i className="far fa-trash-alt a-icon" /> Item 2
                                    </DropdownItem>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

ButtonShowcase.propTypes = {
    size: PropTypes.string.isRequired,
    color: PropTypes.string,
};

const LibraryPanel = () => {

    return (
        <div className="Library">
            <Panel
                header={
                    <div>
                        <h1 className="title">Composants</h1>
                        <p className="subtitle">
                            Liste des composants disponibles
                        </p>
                    </div>
                }
                results={
                    <div className="container">
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

                        <ButtonShowcase size="large" />
                        <ButtonShowcase size="large" color="red" />
                        <ButtonShowcase size="large" color="green" />
                        <ButtonShowcase size="large" color="blue" />

                        <div className="row py-3">
                            <div className="offset-2 col-6">
                                <h5>BUTTONS MEDIUM - 2ND EMPHASIS</h5>
                            </div>
                        </div>

                        <ButtonShowcase size="medium" />
                        <ButtonShowcase size="medium" color="red" />
                        <ButtonShowcase size="medium" color="green" />
                        <ButtonShowcase size="medium" color="blue" />

                        <div className="row py-3">
                            <div className="offset-2 col-6">
                                <h5>BUTTONS SMALL - 3RD EMPHASIS</h5>
                            </div>
                        </div>

                        <ButtonShowcase size="small" />
                        <ButtonShowcase size="small" color="red" />
                        <ButtonShowcase size="small" color="green" />
                        <ButtonShowcase size="small" color="blue" />

                    </div>
                }
            />
        </div>
    );
};

LibraryPanel.propTypes = {};

export default LibraryPanel;
