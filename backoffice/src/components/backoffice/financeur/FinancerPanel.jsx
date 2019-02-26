import React from 'react';
import { FormattedDate } from 'react-intl';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';

import AdviceRates from '../common/deprecated/AdviceRates';
import DeprecatedToolbar from '../common/deprecated/DeprecatedToolbar';
import TrainingSearchForm from './trainingSearchForm';
import EntitySearchForm from './EntitySearchForm';
import OrganisationSearchForm from './OrganisationSearchForm';
import CodeFinancerSearchForm from './CodeFinancerSearchForm';
import {
    getOrganisationAdvices,
    getOrganisationPlaces,
    getOrganisationLieuAdvices,
    loadOragnisationLieuInventory,
    loadInventoryForAllAdvicesWhenFinancerFirstConnexion,
    getAdvices,
    getOrganisations,
    loadInventoryASelectedOrganisation
} from './service/financeurService';
import Dashboard from './stats/Dashboard';
import SideMenu from './SideMenu';

const DEFAULT_ORDER = 'advicesDate';
const POLE_EMPLOI = '4';

export default class FinancerPanel extends React.Component {

    state = {
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
        },
        trainingId: null,
        currentSession: null,
        pagination: {
            current: null,
            count: null,
        },
        order: DEFAULT_ORDER,
        financers: [],
        currentFinancer: {
            _id: null
        },
        currentPage: 'advices'
    };

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        profile: PropTypes.string.isRequired,
        features: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        if (props.codeFinanceur === POLE_EMPLOI) {
            this.state.financers = [
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
            this.state.currentFinancer = '';
        } else {
            this.state.currentFinancer._id = props.codeFinanceur;
        }

        getOrganisations(props.codeRegion, props.codeFinanceur).then(organisations => {
            this.setState(Object.assign(this.state, {
                training: {
                    organisations: organisations,
                    currentOrganisation: '',
                    currentEntity: '',
                    entities: [],
                }
            }));
        });

        this.doGetAdvices();
    };

    handleFinancerChange = (options, evt) => {
        this.setState({
            training: Object.assign(this.state.training, {
                currentOrganisation: '',
                entities: [],
                currentEntity: '',
            }),
            currentFinancer: this.state.financers.filter(function (financer) {
                return financer._id === options.id;
            })[0]
        }, () => {
            this.doGetOrganisations();
            this.doGetAdvices();
        });
    };

    unsetFinancer = () => {
        this.setState({
            currentFinancer: '',
            training: Object.assign(this.state.training, {
                currentOrganisation: '',
                entities: [],
                currentEntity: '',
            })
        }, () => {
            this.doGetOrganisations();
            this.doGetAdvices();
        });
    };

    handleOrganisationChange = async (options, evt) => {
        try {
            this.setState({
                trainingId: null,
                pagination: { current: null, count: null },
                inventory: { reported: 0, commented: 0, all: 0 },
                training: Object.assign(this.state.training, {
                    entities: [],
                    currentEntity: '',
                    currentOrganisation: this.state.training.organisations.filter(function (organisation) {
                        return organisation._id === options.id;
                    })[0]
                })
            }, () => {
                this.doGetOrganisationAdvices();
            });
            const entities = await getOrganisationPlaces(this.props.codeRegion, this.state.currentFinancer._id, options.id);
            if (!entities.error) {
                this.setState({
                    training: Object.assign(this.state.training, {
                        entities: entities,
                    })
                });
            }
        } catch (error) {
            //handle eroor
        }
    };

    unsetOrganisation = () => {
        this.setState({
            training: Object.assign(this.state.training, {
                currentOrganisation: '',
                entities: [],
                currentEntity: '',
            })
        }, () => {
            this.doGetAdvices();
        });
    };


    handleEntityChange = (id, evt) => {
        this.setState({
            trainingId: null,
            pagination: { current: null, count: null },
            inventory: { reported: 0, commented: 0, all: 0 },
            advices: [],
            training: Object.assign(this.state.training, {
                currentEntity: this.state.training.entities.filter(function (entity) {
                    return entity._id === id;
                })[0]
            })
        }, () => {
            this.doLoadAdvices();
        });
    };

    unsetEntity = () => {
        this.setState({
            trainingId: null,
            training: Object.assign(this.state.training, {
                currentEntity: '',

            })
        }, () => {
            this.doGetOrganisationAdvices();
        });
    };

    doGetOrganisations = async () => {

        const organisations = await getOrganisations(this.props.codeRegion, this.state.currentFinancer._id);

        this.setState(Object.assign(this.state, {
            training: {
                organisations: organisations,
                currentOrganisation: '',
                currentEntity: '',
                entities: [],
            }
        }));
    };

    doGetOrganisationAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const page = this.state.pagination.current;
        const avis = await getOrganisationAdvices(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id, this.state.tab, order, page);

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

        const page = this.state.pagination.current;
        const result = await getOrganisationLieuAdvices(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id, this.state.trainingId, this.state.training.currentEntity._id, this.state.tab, order, page);

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

    doGetAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const page = this.state.pagination.current;
        const result = await getAdvices(this.props.codeRegion, this.state.currentFinancer._id, this.state.tab, order, page);

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

    doLoadInventory = async () => {
        if (this.state.training.currentEntity) {
            const inventory = await loadOragnisationLieuInventory(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id, this.state.trainingId, this.state.training.currentEntity._id);
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

    switchTab = tab => {
        this.setState({ tab: tab, pagination: { current: null, count: null } }, () => {
            this.orderBy(DEFAULT_ORDER);
        });
    };

    orderBy = order => {
        this.setState({ order: order }, () => {
            if (this.state.training.currentEntity) {
                this.doLoadAdvices(order);
            } else if (!this.state.training.currentOrganisation) {
                this.doGetAdvices(order);
            } else {
                this.doGetOrganisationAdvices(order);
            }
        });
    };

    changeTrainingSession = async (trainingId, session) => {
        this.setState({ trainingId: trainingId, currentSession: session }, () => {
            this.doLoadAdvices(this.state.order);
        });
        const result = await getOrganisationLieuAdvices(this.props.codeRegion, this.state.currentFinancer._id, this.state.training.currentOrganisation._id, trainingId, session, this.state.tab, this.state.order);
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
            str = `&codeFinanceur=${this.state.currentFinancer._id}`;
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
        const { currentOrganisation, currentEntity, organisations, entities } = this.state.training;
        const { currentFinancer, financers, inventory } = this.state;

        return (
            <div className="organisationPanel mainPanel">

                <SideMenu onChangePage={this.handleChangePage} features={this.props.features} />

                {this.state.currentPage === 'stats' &&
                    <Dashboard codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} />
                }

                {this.state.currentPage === 'advices' &&
                    <div>
                        {this.props.codeFinanceur === POLE_EMPLOI &&
                            <CodeFinancerSearchForm currentFinancer={currentFinancer} financers={financers}
                                handleFinancerChange={this.handleFinancerChange}
                                unsetFinancer={this.unsetFinancer} />
                        }

                        <OrganisationSearchForm currentOrganisation={currentOrganisation} organisations={organisations}
                            handleOrganisationChange={this.handleOrganisationChange}
                            unsetOrganisation={this.unsetOrganisation} />

                        {currentOrganisation &&
                            <EntitySearchForm currentEntity={currentEntity} entities={entities}
                                handleEntityChange={this.handleEntityChange} unsetEntity={this.unsetEntity} />
                        }

                        {currentEntity &&
                            <TrainingSearchForm id={currentOrganisation._id} currentEntity={currentEntity}
                                codeFinanceur={currentFinancer._id} codeRegion={this.props.codeRegion}
                                changeTrainingSession={this.changeTrainingSession} />
                        }

                        <h2>Liste des notes et avis</h2>

                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('rejected')}`} onClick={this.switchTab.bind(this, 'reported')}>Avis signalés <span
                                    className="badge rejected">{inventory.reported}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('commented')}`} onClick={this.switchTab.bind(this, 'commented')}>Avis avec commentaire <span
                                    className="badge published">{inventory.commented}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('all')}`} onClick={this.switchTab.bind(this, 'all')}>Toutes les notes et avis <span
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
                                                        {this.props.codeFinanceur === POLE_EMPLOI &&
                                                            <div> Qualification: {advice.qualification} </div>
                                                        }
                                                    </div>
                                                }
                                                {!advice.comment &&
                                                    <div>
                                                        <div className="noComment">Cet utilisateur n'a pas laissé d'avis.</div>
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
                                    breakLabel={<a className="page-link">...</a>}
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
