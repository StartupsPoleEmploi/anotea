import React from 'react';
import { FormattedDate } from 'react-intl';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';

import AdviceRates from '../common/deprecated/AdviceRates';
import DeprecatedToolbar from '../common/deprecated/DeprecatedToolbar';
import Filter from './filters/filter';
import {
    getRegions,
    getOrganisationAdvices,
    getOrganisationPlaces,
    getPlacesAdvices,
    loadOragnisationLieuInventory,
    loadInventoryForAllAdvicesWhenFinancerFirstConnexion,
    getAdvices,
    getOrganisations,
    loadInventoryASelectedOrganisation,
    getOrganisationLieuFormations
} from './service/financeurService';
import getReponseStatus from '../common/utils/getReponseStatus';

const DEFAULT_ORDER = 'advicesDate';
const POLE_EMPLOI = '4';
const FINANCERS = [
    { _id: '4', title: `Pôle Emploi` },
    { _id: '2', title: `Collectivité territoriale - Conseil régional` },
    { _id: '10', title: `Béneficiaire de l'action` },
    { _id: '0', title: `Autre` },
    { _id: '16', title: `OPCA` },
    { _id: '13', title: `Etat - Autre` },
    { _id: '8', title: `Collectivité territoriale - Conseil général` },
    { _id: '5', title: `Entreprise` },
    { _id: '11', title: `Etat - Ministère chargé de l'emoploi` },
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
            financerId: null,
            reportedAdvicesCount: 0,
            tab: 'all',
            inventory: {
                reported: 0,
                commented: 0,
                all: 0,
            },
            advices: [],
            training: {
                currentOrganisation: '',
                organisations: [],
                currentEntity: '',
                entities: [],
                formations: [],
                currentFormation: {
                    _id: null,
                },
            },
            trainingId: null,
            currentSession: null,
            pagination: {
                current: null,
                count: null,
            },
            order: DEFAULT_ORDER,
            financers: [],
            currentFinancer: {},
            currentPage: 'advices'
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
                currentFinancer: {}
            }, () => {
                this.doGetAdvices();
                this.doGetOrganisations();
            });
        } else {
            this.setState({
                departements,
                currentFinancer: {
                    _id: props.codeFinanceur
                }
            }, () => {
                this.doGetAdvices();
                this.doGetOrganisations();
            });
        }

    }

    doGetAdvices = async (order = this.state.order) => {
        const { props, state } = this;

        this.doLoadInventory();

        const page = this.state.pagination.current;
        const result = await getAdvices(props.codeRegion, state.currentFinancer._id, state.tab, order, page);

        this.setState({
            pagination: { current: result.page, count: result.pageCount },
            advices: result.advices.map(advice => {

                if (advice.comment) {
                    advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                }
                return advice;
            })
        });

    };

    doGetOrganisations = async () => {
        const { props, state } = this;
        const organisations = await getOrganisations(props.codeRegion, state.currentFinancer._id);

        this.setState(prevState => ({
            training: {
                ...prevState.training,
                organisations: organisations
            }
        }));

    };

    doLoadInventory = async () => {
        if (this.state.training.currentEntity) {
            const inventory = await loadOragnisationLieuInventory(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id, this.state.training.currentFormation._id, this.state.training.currentEntity._id);
            this.setState(Object.assign(this.state, {
                inventory: inventory
            }));
        } else if (!this.state.training.currentOrganisation) {
            const inventory = await loadInventoryForAllAdvicesWhenFinancerFirstConnexion(this.props.codeRegion, this.state.currentFinancer._id);
            this.setState(Object.assign(this.state, {
                inventory: inventory
            }));
        } else {
            const inventory = await loadInventoryASelectedOrganisation(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id);
            if (!inventory.error) {
                this.setState({ inventory: inventory });
            }
        }
    };

    handleFinancerChange = (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    organisations: [],
                    currentOrganisation: '',
                    entities: [],
                    currentEntity: '',
                },
                currentFinancer: {
                    ...prevState.currentFinancer,
                    _id: options.id,
                    label: options.label
                },
            }), () => {
                this.doGetOrganisations();
                this.doGetAdvices();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    organisations: [],
                    currentOrganisation: '',
                    entities: [],
                    currentEntity: '',
                },
                currentFinancer: {}
            }), () => {
                this.doGetOrganisations();
                this.doGetAdvices();
            });
        }

    };

    handleDepartementsChange = options => {

        if (options) {
            this.setState(prevState => ({
                currentDepartement: {
                    ...prevState.currentDepartement,
                    id: options.id,
                    label: options.label
                }
            }));
        } else {
            this.setState(prevState => ({
                currentDepartement: {
                    ...prevState.currentDepartement,
                    id: '',
                    label: ''
                }
            }));
        }

    }

    handleOrganisationChange = async (options, evt) => {
        const { training } = this.state;

        if (options) {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    entities: [],
                    currentEntity: '',
                    currentOrganisation: training.organisations.filter(organisation => organisation._id === options.id)[0]
                },
            }), () => {
                this.doGetOrganisationAdvices();
                this.getPlaces();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentOrganisation: '',
                    entities: [],
                    currentEntity: '',
                }
            }), () => {
                this.doGetAdvices();
            });
        }

    };

    getPlaces = async () => {
        const { props, state } = this;
        const entities = await getOrganisationPlaces(props.codeRegion, state.currentFinancer._id, state.training.currentOrganisation._id);

        this.setState(prevState => ({
            training: {
                ...prevState.training,
                entities: entities,
            }
        }));
        
    }

    handleEntityChange = async (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentEntity: {
                        ...prevState.currentEntity,
                        _id: options.id,
                        label: options.label
                    },
                    currentFormation: {
                        _id: null,
                        label: ''
                    }
                }
            }), () => {
                this.doLoadAdvices();
                this.getFormations();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentEntity: '',
                }
            }), () => {
                this.doGetOrganisationAdvices();
            });
        }

    };

    getFormations = async () => {
        const { currentFinancer, training } = this.state;
        const { codeRegion } = this.props;
        const formations = await getOrganisationLieuFormations(codeRegion, currentFinancer._id, training.currentOrganisation._id, training.currentEntity._id);
        

        this.setState(prevState => ({
            training: {
                ...prevState.training,
                formations,
            }
        }));
        
    }

    doGetOrganisationAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const { state, props } = this;
        const page = this.state.pagination.current;
        const avis = await getOrganisationAdvices(props.codeRegion, state.currentFinancer._id, state.training.currentOrganisation._id, state.tab, order, page);

        this.setState({
            pagination: { current: avis.page, count: avis.pageCount },
            advices: avis.advices.map(advice => {

                if (advice.comment) {
                    advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                }
                return advice;
            })
        });

    };

    doLoadAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const { currentFinancer, training, tab } = this.state;
        const { codeRegion } = this.props;
        const page = this.state.pagination.current;
        const result = await getPlacesAdvices(codeRegion, currentFinancer._id, training.currentOrganisation._id, training.currentFormation._id, training.currentEntity._id, tab, order, page);

        this.setState({
            pagination: { current: result.page, count: result.pageCount },
            advices: result.advices.map(advice => {
                if (advice.comment) {
                    advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                }
                return advice;
            })
        });

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
            if (this.state.training.currentEntity) {
                this.doLoadAdvices(order);
            } else if (!this.state.training.currentOrganisation) {
                this.doGetAdvices(order);
            } else {
                this.doGetOrganisationAdvices(order);
            }
        });

    };

    handleFormationChange = async (options, evt) => {

        if (options) {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentFormation: {
                        ...prevState.currentFormation,
                        _id: options.id,
                        label: options.label
                    }
                }
            }), () => {
                this.doLoadAdvices();
            });
        } else {
            this.setState(prevState => ({
                training: {
                    ...prevState.training,
                    currentFormation: {
                        _id: null,
                        label: ''
                    },
                }
            }), () => {
                this.doLoadAdvices();
            });
        }

    };

    handlePageClick = data => {
        if (this.state.training.currentEntity) {
            this.setState({ pagination: { current: data.selected + 1 } }, () => {
                this.doLoadAdvices();
            });
        } else if (!this.state.training.currentOrganisation) {
            this.setState({ pagination: { current: data.selected + 1 } }, () => {
                this.doGetAdvices();
            });
        } else if (!this.state.training.currentEntity && this.state.training.currentOrganisation) {
            this.setState({ pagination: { current: data.selected + 1 } }, () => {
                this.doGetOrganisationAdvices();
            });
        }

    };

    getActiveStatus = current => this.state.tab === current ? 'active' : '';

    handleChangePage = page => {
        this.setState({ currentPage: page });
    };

    getExportFilters = () => {
        let str = `?status=${this.state.tab}`;
        if (this.state.currentFinancer) {
            str += `&codeFinanceur=${this.state.currentFinancer._id}`;
        }
        if (this.state.training) {
            if (this.state.training.currentOrganisation) {
                str += `&siret=${this.state.training.currentOrganisation._id}`;
            }
            if (this.state.training.currentEntity) {
                str += `&postalCode=${this.state.training.currentEntity._id}`;
            }
            if (this.state.trainingId) {
                str += `&trainingId=${this.state.trainingId}`;
            }
        }

        return str;
    };

    render() {
        const { currentOrganisation, currentEntity, organisations, entities, formations, currentFormation } = this.state.training;
        const { currentFinancer, financers, inventory, departements, currentDepartement } = this.state;
        const organisationsOptions = organisations.map(organisation => ({
            label: organisation.name + ` (` + organisation.label + `) ` + organisation.count + `Avis`,
            id: organisation._id,
        }));
        const departementsOptions = departements.map(dep => ({
            label: dep,
            id: dep,
        }));
        const financersOptions = financers.map(financer => ({
            label: financer.title,
            id: financer._id,
        }));
        const placesOptions = entities.map(place => ({
            label: place.city,
            id: place._id,
        }));
        const formationsOptions = formations.map(formation => ({
            label: formation.title + ` (` + formation.count + `avis)`,
            id: formation._id,
        }));

        return (
            <div className="organisationPanel mainPanel">

                {this.state.currentPage === 'advices' &&
                <div>

                    {this.props.codeFinanceur === POLE_EMPLOI &&
                    <Filter
                        options={financersOptions}
                        onChange={this.handleFinancerChange}
                        placeholderText="Veuillez choisir un financeur..."
                        selectValue={currentFinancer}
                    />
                    }

                    <Filter
                        options={departementsOptions}
                        onChange={this.handleDepartementsChange}
                        placeholderText="Veuillez choisir un département..."
                        selectValue={currentDepartement}
                    />

                    <Filter
                        options={organisationsOptions}
                        onChange={this.handleOrganisationChange}
                        placeholderText="Veuillez choisir un organisme de formation..."
                        selectValue={currentOrganisation}
                    />

                    {currentOrganisation &&
                    <Filter
                        options={placesOptions}
                        onChange={this.handleEntityChange}
                        placeholderText="Veuillez choisir un lieu..."
                        selectValue={currentEntity}
                    />
                    }

                    {currentEntity &&
                    <Filter
                        options={formationsOptions}
                        placeholderText="Veuillez choisir une formation..."
                        onChange={this.handleFormationChange}
                        selectValue={currentFormation}
                    />
                    }

                    <h2>Liste des notes et avis</h2>

                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button className={`nav-link btn btn-link ${this.getActiveStatus('reported')}`}
                                onClick={this.switchTab.bind(this, 'reported')}>Avis signalés <span
                                    className="badge reported">{inventory.reported}</span></button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link btn btn-link ${this.getActiveStatus('commented')}`}
                                onClick={this.switchTab.bind(this, 'commented')}>Avis avec commentaire <span
                                    className="badge published">{inventory.commented}</span></button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link btn btn-link ${this.getActiveStatus('rejected')}`}
                                onClick={this.switchTab.bind(this, 'rejected')}>Avis rejetés <span
                                    className="badge rejected">{inventory.rejected}</span></button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link btn btn-link ${this.getActiveStatus('all')}`}
                                onClick={this.switchTab.bind(this, 'all')}>Toutes les notes et avis <span
                                    className="badge badge-secondary">{inventory.all}</span></button>
                        </li>
                    </ul>

                    <DeprecatedToolbar profile={this.props.profile} exportFilters={this.getExportFilters()} />

                    <div className="advices">
                        {this.state.advices.length === 0 && <em>Pas d'avis pour le moment</em>}
                        {this.state.advices.map(advice =>
                            <div key={advice._id} className="advice">
                                <div className="content">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h3 className="header">
                                                <i className="avatar glyphicon glyphicon-user" />
                                                {advice.pseudo}
                                                {!advice.pseudo && <em>anonyme</em>} -&nbsp;

                                                {advice.date &&
                                                <FormattedDate
                                                    value={new Date(advice.date)}
                                                    day="numeric"
                                                    month="long"
                                                    year="numeric" />
                                                }
                                                {!advice.date && <em>Pas de date pour cet avis</em>}
                                            </h3>
                                            {advice.comment &&
                                            <div>
                                                <div className="comment">
                                                    <h4>{advice.comment.title}</h4>
                                                    <p>
                                                        {advice.comment.text}
                                                        {!advice.comment.text &&
                                                        <em>Cet utilisateur n'a pas laissé d'avis</em>}
                                                    </p>
                                                </div>
                                                {this.props.codeFinanceur === POLE_EMPLOI && advice.published &&
                                                <div> Qualification: {advice.qualification} </div>
                                                }
                                                {advice.rejected &&
                                                <div>Qualification: {advice.rejectReason} </div>
                                                }
                                            </div>
                                            }
                                            {!advice.comment &&
                                            <div>
                                                <div className="noComment">Cet utilisateur n'a pas laissé d'avis.</div>
                                            </div>
                                            }
                                            {advice.reponse &&
                                            <div className="answer financeur">
                                                <h4>Réponse de
                                                    l'organisme <span>({getReponseStatus(advice.reponse)})</span></h4>
                                                <p>{advice.reponse.text}</p>
                                            </div>
                                            }
                                        </div>
                                        <div className="col-md-3">
                                            <AdviceRates rates={advice.rates} />
                                        </div>
                                        <div className="col-md-3">
                                            <div><strong>Organisme</strong> {advice.training.organisation.name}</div>
                                            <div><strong>Formation</strong> {advice.training.title}</div>
                                            <strong>Session</strong> {advice.training.place.city}
                                            <div>
                                                du <strong><FormattedDate
                                                    value={new Date(advice.training.startDate)}
                                                    day="numeric"
                                                    month="numeric"
                                                    year="numeric" /></strong>
                                                &nbsp;au <strong><FormattedDate
                                                    value={new Date(advice.training.scheduledEndDate)}
                                                    day="numeric"
                                                    month="numeric"
                                                    year="numeric" /></strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>)}

                        {this.state.pagination.count > 1 &&
                        <ReactPaginate previousLabel={'<'}
                            nextLabel={'>'}
                            pageCount={this.state.pagination.count}
                            forcePage={this.state.pagination.current - 1}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
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
        );
    }
}
