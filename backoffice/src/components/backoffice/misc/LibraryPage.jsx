import React from 'react';
import PropTypes from 'prop-types';
import './LibraryPage.scss';
import Button from '../common/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../common/Dropdown';
import NewPanel from '../common/page/panel/NewPanel';
import Filter from '../common/page/panel/filters/Filter';
import { Filters } from '../common/page/panel/filters/Filters';
import Pagination from '../common/page/panel/pagination/Pagination';
import { Form, Periode, Select } from '../common/page/form/Form';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import Page from '../common/page/Page';
import Pie from '../common/page/panel/results/stats/Pie';

const ButtonShowcase = ({ size, color }) => {
    return (
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
                <div className="box">
                    <Dropdown
                        className="d-flex justify-content-center"
                        header="Header"
                        button={
                            <Button size={size} color={color} toggable={true}>
                                DROPDOWN
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
    );
};

ButtonShowcase.propTypes = {
    size: PropTypes.string.isRequired,
    color: PropTypes.string,
};

const LibraryPage = () => {

    let noop = () => ({});

    let buttons = () => {
        return (
            <div>
                <div className="row py-3">
                    <div className="offset-1 col-2">
                        <h3>BUTTONS</h3>
                    </div>
                </div>

                <div className="row py-3">
                    <div className="offset-1 col-6">
                        <h5>BUTTONS LARGE - 1ST EMPHASIS</h5>
                    </div>
                </div>

                <ButtonShowcase size="large" />
                <ButtonShowcase size="large" color="red" />
                <ButtonShowcase size="large" color="green" />
                <ButtonShowcase size="large" color="blue" />

                <div className="row py-3">
                    <div className="offset-1 col-6">
                        <h5>BUTTONS MEDIUM - 2ND EMPHASIS</h5>
                    </div>
                </div>

                <ButtonShowcase size="medium" />
                <ButtonShowcase size="medium" color="red" />
                <ButtonShowcase size="medium" color="green" />
                <ButtonShowcase size="medium" color="blue" />

                <div className="row py-3">
                    <div className="offset-1 col-6">
                        <h5>BUTTONS SMALL - 3RD EMPHASIS</h5>
                    </div>
                </div>

                <ButtonShowcase size="small" />
                <ButtonShowcase size="small" color="red" />
                <ButtonShowcase size="small" color="green" />
                <ButtonShowcase size="small" color="blue" />
            </div>
        );
    };

    let graphiques = () => {
        return (
            <div>
                <div className="row py-3">
                    <div className="offset-1 col-2">
                        <h3>Graphiques</h3>
                    </div>
                </div>

                <div className="row py-3">
                    <div className="offset-2 col-4">
                        <Pie data={[
                            {
                                'id': 'Données 1',
                                'value': 80,
                            },
                            {
                                'id': 'Données 2',
                                'value': 20,
                            },
                        ]} />
                    </div>
                </div>

            </div>
        );
    };

    return (
        <Page
            className="LibraryPage"
            color="green"
            form={
                <Form>
                    <div className="form-group">
                        <label>Periode</label>
                        <Periode
                            periode={{ startDate: new Date(), endDate: new Date() }}
                            onChange={noop}
                        />
                    </div>
                    <div className="form-group">
                        <label>Select</label>
                        <Select
                            value={null}
                            options={[{ code: 'code', label: 'label' }, { code: 'code2', label: 'label2' }]}
                            loading={false}
                            optionKey="code"
                            optionLabel="label"
                            placeholder={'Données'}
                            onChange={noop}
                        />
                    </div>
                </Form>
            }
            tabs={
                <Tabs>
                    <Tab label="<Tab/> (active)" isActive={() => true} onClick={noop} />
                    <Tab label="<Tab/> (inactive)" isActive={() => false} onClick={noop} />
                </Tabs>
            }
            panel={
                <NewPanel
                    filters={
                        <Filters>
                            <Filter
                                label="<Filter/> (actif)"
                                isActive={() => true}
                                onClick={noop} />

                            <Filter
                                label="<Filter/> (inactif)"
                                isActive={() => false}
                                onClick={noop} />
                        </Filters>
                    }
                    summary={
                        <div className="zone">
                            <span>Panel summary</span>
                        </div>
                    }
                    results={
                        <div className="zone">
                            <span>Panel results</span>
                            {buttons()}
                            {graphiques()}
                        </div>
                    }
                    pagination={
                        <div className="zone">
                            <span>Panel pagination</span>
                            <Pagination pagination={{
                                itemsOnThisPage: 10,
                                itemsPerPage: 10,
                                page: 0,
                                totalItems: 100,
                                totalPages: 10,
                            }} onClick={noop} />
                        </div>

                    }
                />
            } />
    );
};

LibraryPage.propTypes = {};

export default LibraryPage;
