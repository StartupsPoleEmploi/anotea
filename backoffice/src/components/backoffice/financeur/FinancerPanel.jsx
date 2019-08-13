import React from 'react';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import Filter from './filters/filter';
import {
    getRegions,
    getPlaces,
    getInventory,
    getAdvices,
    getOrganisations,
    getFormations
} from './service/financeurService';
import Resume from './Resume';
import Avis from './Avis';
import ResultDivider from '../common/panel/ResultDivider';
import './FinancerPanel.scss';
import FiltersResume from './FiltersResume';
import Loader from '../common/Loader';

const DEFAULT_ORDER = 'advicesDate';
const POLE_EMPLOI = '4';
const FINANCERS = [
    { _id: '4', title: `Pôle Emploi` },
    { _id: '2', title: `Collectivité territoriale - CR` },
    { _id: '10', title: `Béneficiaire de l'action` },
    { _id: '0', title: `Autre` },
    { _id: '16', title: `OPCA` },
    { _id: '13', title: `Etat - Autre` },
    { _id: '8', title: `Collectivité territoriale - CR` },
    { _id: '5', title: `Entreprise` },
    { _id: '11', title: `Etat - Ministère chargé de l'emploi` },
    { _id: '15', title: `Collectivité territoriale - Autre` },
    { _id: '14', title: `Fonds Européens - Autre` },
    { _id: '3', title: `Fonds Européens - FSE` },
    { _id: '12', title: `Etat - Ministère de l'éducation nationale` },
    { _id: '7', title: `AGEFIPH` },
    { _id: '17', title: `OPACIF` },
    { _id: '9', title: `Collectivité territoriale - Commune` },
];

export default class FinancerPanel extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        profile: PropTypes.string.isRequired,
        features: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            departements: [],
            currentDepartement: {},
            tab: 'all',
            inventory: {
                reported: 0,
                commented: 0,
                all: 0,
            },
            advices: [],
            training: {
                currentOrganisation: {},
                organisations: [],
                currentEntity: {},
                entities: [],
                formations: [],
                currentFormation: {},
            },
            pagination: {
                current: null,
                count: null,
            },
            order: DEFAULT_ORDER,
            financers: [],
            currentFinancer: {},
            currentPage: 'advices',
            loading: false
        };

    }

    componentDidMount = async () => {
        const { props } = this;
        const regions = await getRegions();
        const departements = regions.filter(r => r.codeRegion === props.codeRegion)[0].departements;

        if (props.codeFinanceur === POLE_EMPLOI) {
            this.setState({
                departements,
                financers: FINANCERS,
                currentFinancer: {},
                loading: true,
            }, () => {
                this.doGetAdvices();
                this.doGetOrganisations();
                this.doGetPlaces();
            });
        } else {
            this.setState({
                departements,
                currentFinancer: {
                    _id: props.codeFinanceur,
                    label: FINANCERS.find(f => f._id === props.codeFinanceur).title
                },
                loading: true,
            }, () => {
                this.doGetAdvices();
                this.doGetOrganisations();
                this.doGetPlaces();
            });
        }

    }

    doGetAdvices = async (order = this.state.order) => {
        const { codeRegion } = this.props;
        const { currentOrganisation, currentEntity, currentFormation } = this.state.training;
        const { currentFinancer, tab, currentDepartement } = this.state;

        this.doLoadInventory();

        const page = this.state.pagination.current;
        const result = await getAdvices(codeRegion, currentFinancer._id, currentDepartement._id, currentOrganisation._id, currentEntity._id, currentFormation._id, tab, order, page);

        this.setState({
            pagination: { current: result.page, count: result.pageCount },
            advices: result.advices.map(advice => {

                if (advice.comment) {
                    advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                }
                return advice;
            }),
            loading: false,
        });

    };

    doGetOrganisations = async () => {
        const { props, state } = this;
        const organisations = await getOrganisations(props.codeRegion, state.currentFinancer._id, state.currentDepartement._id);

        this.setState(prevState => ({
            training: {
                ...prevState.training,
                organisations: organisations
            }
        }));

    };

    doLoadInventory = async () => {
        const { codeRegion } = this.props;
        const { currentOrganisation, currentEntity, currentFormation } = this.state.training;
        const { currentFinancer, currentDepartement } = this.state;
        const inventory = await getInventory(codeRegion, currentFinancer._id, currentDepartement._id, currentOrganisation._id, currentEntity._id, currentFormation._id);
        
        this.setState(Object.assign(this.state, {
            inventory: inventory
        }));
    };

    handleFinancerChange = (options, evt) => {

        if (options) {
            this.setState({
                pagination: {
                    current: null
                },
                loading: true,
                currentFinancer: {
                    _id: options.id,
                    label: options.label
                },
                currentDepartement: {},
            }, () => {
                this.initTraining();
            });
        } else {
            this.initFilters();
        }

    };

    initTraining = () => {

        this.setState({
            training: {
                organisations: [],
                currentOrganisation: {},
                entities: [],
                currentEntity: {},
                formations: [],
                currentFormation: {}
            },
            loading: true,
        }, () => {
            this.doGetOrganisations();
            this.doGetAdvices();
            this.doGetPlaces();
        });
    };

    initFilters = () => {

        this.setState({
            training: {
                organisations: [],
                currentOrganisation: {},
                entities: [],
                currentEntity: {},
                formations: [],
                currentFormation: {}
            },
            currentFinancer: {},
            currentDepartement: {},
            loading: true,
        }, () => {
            this.doGetOrganisations();
            this.doGetAdvices();
            this.doGetPlaces();
        });
    };

    handleDepartementsChange = options => {

        if (options) {
            this.setState({
                pagination: {
                    current: null
                },
                loading: true,
                currentDepartement: {
                    _id: options.id,
                    label: options.label
                },
            }, () => {
                this.initTraining();
            });
        } else {
            this.setState({
                training: {
                    organisations: [],
                    currentOrganisation: {},
                    entities: [],
                    currentEntity: {},
                    formations: [],
                    currentFormation: {}
                },
                currentFinancer: {},
                currentDepartement: {},
                loading: true,
            }, () => {
                this.doGetOrganisations();
                this.doGetAdvices();
                this.doGetPlaces();
            });
        }

    };

    handleOrganisationChange = async (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                pagination: {
                    current: null
                },
                training: {
                    ...prevState.training,
                    entities: [],
                    currentEntity: {},
                    currentOrganisation: {
                        _id: options.id,
                        label: options.label
                    },
                    formations: [],
                    currentFormation: {}
                },
            }), () => {
                this.doGetAdvices();
                this.doGetPlaces();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentOrganisation: {},
                    entities: [],
                    currentEntity: {},
                    formations: [],
                    currentFormation: {}
                }
            }), () => {
                this.doGetAdvices();
                this.doGetPlaces();
            });
        }

    };

    doGetPlaces = async () => {
        const { codeRegion } = this.props;
        const { currentFinancer, currentDepartement, training } = this.state;
        const entities = await getPlaces(codeRegion, currentFinancer._id, currentDepartement._id, training.currentOrganisation._id);

        this.setState(prevState => ({
            training: {
                ...prevState.training,
                entities: entities,
            }
        }));
        
    };

    handleEntityChange = async (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                pagination: {
                    current: null
                },
                training: {
                    ...prevState.training,
                    currentEntity: {
                        _id: options.id,
                        label: options.label
                    },
                    currentFormation: {}
                }
            }), () => {
                this.doGetAdvices();
                this.getFormations();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentEntity: {},
                    currentFormation: {}
                }
            }), () => {
                this.doGetAdvices();
            });
        }

    };

    getFormations = async () => {
        const { currentFinancer, training } = this.state;
        const { codeRegion } = this.props;
        const formations = await getFormations(codeRegion, currentFinancer._id, training.currentOrganisation._id, training.currentEntity._id);
        
        this.setState(prevState => ({
            training: {
                ...prevState.training,
                formations,
            }
        }));
        
    };

    switchTab = tab => {

        this.setState({
            tab: tab,
            pagination: { current: null, count: null }
        }, () => {
            this.orderBy(DEFAULT_ORDER);
        });

    };

    orderBy = order => {

        this.setState({
            order: order
        }, () => {
            this.doGetAdvices(order);
        });

    };

    handleFormationChange = async (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                pagination: {
                    current: null
                },
                training: {
                    ...prevState.training,
                    currentFormation: {
                        _id: options.id,
                        label: options.label
                    }
                }
            }), () => {
                this.doGetAdvices();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentFormation: {},
                }
            }), () => {
                this.doGetAdvices();
            });
        }

    };

    handlePageClick = data => {
        this.setState({
            pagination: {
                current: data.selected + 1
            }
        }, () => {
            this.doGetAdvices();
        });
    };

    getActiveStatus = current => this.state.tab === current ? 'active' : '';
    
    getExportFilters = () => {
        let str = `?status=${this.state.tab}`;
        if (this.state.currentFinancer._id) {
            str += `&codeFinanceur=${this.state.currentFinancer._id}`;
        }
        if (this.state.training) {
            if (this.state.training.currentOrganisation._id) {
                str += `&siret=${this.state.training.currentOrganisation._id}`;
            }
            if (this.state.training.currentEntity._id) {
                str += `&postalCode=${this.state.training.currentEntity._id}`;
            }
            if (this.state.training.currentFormation._id) {
                str += `&formationId=${this.state.training.currentFormation._id}`;
            }
        }

        return str;
    };

    isActiveFilter = () => {
        const { currentOrganisation, currentEntity, currentFormation } = this.state.training;
        const { currentFinancer, currentDepartement } = this.state;
        
        return currentFinancer._id || currentOrganisation._id || currentEntity._id || currentFormation._id || currentDepartement._id ? 'active' : '';
    }

    render() {
        const { currentOrganisation, currentEntity, organisations, entities, formations, currentFormation } = this.state.training;
        const { currentFinancer, financers, inventory, departements, currentDepartement } = this.state;
        const organisationsOptions = organisations.map(organisation => ({
            label: organisation.name.length >= 50 ? organisation.name.substring(0, 50).concat('...') : organisation.name,
            id: organisation._id,
            className: 'custom-class'
        }));
        const departementsOptions = departements.map(dep => ({
            label: dep,
            id: dep,
            className: 'custom-class'
        }));
        const financersOptions = financers.map(financer => ({
            label: financer.title + ' (' + financer._id + ')',
            id: financer._id,
            className: 'custom-class'
        }));
        const placesOptions = entities.map(place => ({
            label: place.city + ' (' + place._id + ')',
            id: place._id,
            className: 'custom-class'
        }));
        const formationsOptions = formations.map(formation => ({
            label: formation.title.length >= 50 ? formation.title.substring(0, 50).concat('...') : formation.title,
            id: formation._id,
            className: 'custom-class'
        }));

        return (
            <div className="financer-panel">
                <div className="header">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="filters-area">
                                <div className="first-part d-flex flex-wrap flex-md-row justify-content-between align-items-center">
                                    {this.props.codeFinanceur === POLE_EMPLOI &&
                                        <Filter
                                            label="Financeur"
                                            options={financersOptions}
                                            onChange={this.handleFinancerChange}
                                            placeholderText="Choisissez un code financeur"
                                            selectValue={currentFinancer}
                                        />
                                    }
                                    <Filter
                                        label="Période"
                                        options={departementsOptions}
                                        onChange={this.handleDepartementsChange}
                                        placeholderText="JJ/MM/AAAA à JJ/MM/AAAA"
                                        selectValue={currentDepartement}
                                    />
                                    <Filter
                                        label="Département"
                                        options={departementsOptions}
                                        onChange={this.handleDepartementsChange}
                                        placeholderText="Choisisez un département"
                                        selectValue={currentDepartement}
                                    />
                                    <Filter
                                        label="Organisme de formation"
                                        options={organisationsOptions}
                                        onChange={this.handleOrganisationChange}
                                        placeholderText="Choisissez un organisme"
                                        selectValue={currentOrganisation}
                                    />
                                    <Filter
                                        label="Lieu"
                                        options={placesOptions}
                                        onChange={this.handleEntityChange}
                                        placeholderText="Choisissez un lieu"
                                        selectValue={currentEntity}
                                    />
                                    {currentEntity._id && currentOrganisation._id &&
                                        <Filter
                                            label="Formation"
                                            options={formationsOptions}
                                            placeholderText="Choisissez une formation"
                                            onChange={this.handleFormationChange}
                                            selectValue={currentFormation}
                                        />
                                    }
                                    <button className={`init-filter-button ${this.isActiveFilter()}`} onClick={this.initFilters}>
                                        <i className="fas fa-times"></i> réinitialiser les filtres
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="d-flex justify-content-center header-end">
                                <NavLink to="/admin/financeur/statistiques" activeStyle={{ opacity: '1' }} className="bd-highlight">Statistiques</NavLink>
                                <NavLink to="/admin/financeur" activeStyle={{ opacity: '1' }} className="bd-highlight">Liste des avis</NavLink>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row justify-content-center financer-toolbar">
                        <div className="d-flex flex-wrap align-items-center">
                            <button
                                className={`onglet ${this.getActiveStatus('all')}`}
                                onClick={this.switchTab.bind(this, 'all')} >Tous
                            </button>
                            <button
                                className={`onglet ${this.getActiveStatus('reported')}`}
                                onClick={this.switchTab.bind(this, 'reported')} >Signalés
                            </button>
                            <button className={`onglet ${this.getActiveStatus('commented')}`}
                                onClick={this.switchTab.bind(this, 'commented')}>Avec commentaires
                            </button>
                            <button
                                className={`onglet ${this.getActiveStatus('rejected')}`}
                                onClick={this.switchTab.bind(this, 'rejected')} >Rejetés
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="resume">
                            <div className="d-flex bd-highlight mb-3">
                                <FiltersResume
                                    currentFinancer={currentFinancer}
                                    currentOrganisation={currentOrganisation}
                                    currentDepartement={currentDepartement}
                                    currentEntity={currentEntity}
                                    currentFormation={currentFormation} />
                                <Resume
                                    advices={this.state.advices}
                                    page={this.state.pagination.current}
                                    inventory={inventory[this.state.tab]}
                                    exportFilters={this.getExportFilters()} />
                            </div>
                        </div>
                    </div>

                    {this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {
                                this.state.advices.map(avis => {
                                    return (
                                        <div key={avis._id}>
                                            <Avis
                                                avis={avis}
                                                codeFinanceur={this.props.codeFinanceur}/>
                                            <ResultDivider />
                                        </div>
                                    );
                                })
                            }
                        </div>
                    }
                    
                    {!this.state.loading &&
                        <div className="Pagination">
                            <div className="d-flex justify-content-center">
                                {this.state.pagination.count > 1 &&
                                <ReactPaginate previousLabel={'<'}
                                    nextLabel={'>'}
                                    pageCount={this.state.pagination.count}
                                    forcePage={this.state.pagination.current - 1}
                                    marginPagesDisplayed={1}
                                    pageRangeDisplayed={2}
                                    onPageChange={this.handlePageClick}
                                    breakClassName="page-item"
                                    breakLabel={<button className="page-link">...</button>}
                                    pageClassName="page-item"
                                    previousClassName="page-item"
                                    nextClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousLinkClassName="page-link"
                                    nextLinkClassName="page-link"
                                    activeClassName={'active'}
                                    containerClassName={'pagination'}
                                    disableInitialCallback={true} />
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}
