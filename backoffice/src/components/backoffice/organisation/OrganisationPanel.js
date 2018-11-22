import React from 'react';
import { FormattedDate } from 'react-intl';
import ReactPaginate from 'react-paginate';

import AdviceRates from '../common/adviceRates';
import Toolbar from '../common/Toolbar';
import SearchForm from './searchForm';
import EntitySearchForm from './entitySearchForm';
import Graphes from './Graphes';
// import NotesFilter          from './notesFilter'

import Notice from './Notice';

import {
    getOrganisationInfo,
    loadAllInventory,
    loadAdvices,
    loadAllAdvices,
    loadInventory
} from '../../../lib/organisationService';
import {
    markAdviceAsRead,
    markAdviceAsNotRead,
    reportAdvice,
    unreportAdvice,
    answerAdvice,
    removeAdviceAnswer
} from '../../../lib/adviceService';

const DEFAULT_ORDER = 'moderation';
const MAX_LENGTH = 200;

export default class OrganisationPanel extends React.Component {

    state = {
        organisationId: null,
        reportedAdvicesCount: 0,
        tab: 'unread',
        inventory: {
            unread: 0,
            read: 0,
            reported: 0,
            answered: 0,
            all: 0
        },
        advices: [],
        training: {
            name: 'untitled',
            currentEntity: '',
            entities: [],
        },
        currentEntity: null,
        trainingId: '',
        currentSession: null,
        pagination: {
            current: null,
            count: null
        },
        order: DEFAULT_ORDER,
        reply: {
            shown: false,
            text: ''
        }
    };

    constructor(props) {
        super(props);

        // Got an error in console
        //this.setState(Object.assign(this.state, { organisationId : props.id}))

        // Known issue: console ask to use setState above
        this.state.organisationId = props.id;

        getOrganisationInfo(props.id).then(info => {
            const entities = info.places.map(place => {
                place.id = place._id;
                delete place._id;
                return place;
            });

            this.setState({
                training: {
                    entities: entities
                }
            });
        });

        this.doLoadAllAdvices();
    }

    handleReport = (id, evt) => {
        reportAdvice(id, this.state.organisationId).then(result =>
            this.doLoadAdvices()
        );
    };

    handleUnreport = (id, evt) => {
        unreportAdvice(id, this.state.organisationId).then(result =>
            this.doLoadAdvices()
        );
    };

    handleMarkAsRead = (id, evt) => {
        markAdviceAsRead(id, this.state.organisationId).then(result =>
            this.doLoadAdvices()
        );
    };

    handleMarkAsNotRead = (id, evt) => {
        markAdviceAsNotRead(id, this.state.organisationId).then(result =>
            this.doLoadAdvices()
        );
    };

    handleReply = (id, evt) => {
        this.state.advices.map(advice => {
            if (advice._id === id) {
                this.setState({
                    reply: {
                        shown: true,
                        id: id,
                        text: advice.answer !== undefined ? advice.answer : ''
                    }
                });
            }
        });
    };

    handleCancelReply = (id, evt) => {
        this.setState({ reply: { shown: false, text: '' } });
    };

    handleReplyChange = (id, evt) => {
        if (evt.target.value.length <= MAX_LENGTH) {
            this.setState(Object.assign(this.state.reply, { text: evt.target.value }), () => {
                let reached = false;
                if (this.state.reply.text.length === MAX_LENGTH) {
                    reached = true;
                }
                this.setState(Object.assign(this.state.reply, { maxLengthReached: reached }));
            });
        }
    };

    handleDoReply = (id, evt) => {
        const text = this.state.reply.text;
        answerAdvice(id, text).then(result => {
            this.setState({ reply: { shown: false, text: '' } });
            this.doLoadAdvices();
        });
    };

    handleRemoveReply = (id, evt) => {
        removeAdviceAnswer(id).then(result => {
            this.setState({ reply: { shown: false, text: '' } });
            this.doLoadAdvices();
        });
    };

    handleEntityChange = (options, evt) => {
        this.setState({
            trainingId: null,
            pagination: { current: null, count: null },
            inventory: { reported: 0, commented: 0, all: 0 },
            advices: [],
            training: Object.assign(this.state.training, {
                currentEntity: this.state.training.entities.filter(function(entity) {
                    return entity.id === options.id;
                })[0]
            })
        }, () => {
            this.doLoadAdvices();
        });
    };

    unsetEntity = () => {
        this.setState({
            training: Object.assign(this.state.training, {
                currentEntity: '',
            })
        }, () => {
            this.doLoadAllAdvices();
        });
    };

    doLoadAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const page = this.state.pagination.current;

        if (this.state.training.currentEntity) {
            const result = await loadAdvices(this.state.organisationId, this.state.trainingId, this.state.training.currentEntity.id, this.state.tab, order, page);
            this.setState({
                pagination: { current: result.page, count: result.pageCount },
                advices: result.advices.map(advice => {
                    if (advice.comment) {
                        advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                    }
                    return advice;
                })
            });
        } else {
            this.doLoadAllAdvices();
        }
    };

    doLoadAllAdvices = async (order = this.state.order) => {
        this.doLoadInventory();

        const page = this.state.pagination.current;
        const result = await loadAllAdvices(this.state.organisationId, this.state.tab, order, page);

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
            const inventory = await loadInventory(this.state.organisationId, this.state.trainingId, this.state.training.currentEntity.id);
            this.setState({ inventory: inventory });
        } else {
            const inventory = await loadAllInventory(this.state.organisationId);
            this.setState({ inventory: inventory });
        }
    };

    switchTab = tab => {
        this.setState({ tab: tab, pagination: { current: null, count: null } }, () => {
            this.orderBy(DEFAULT_ORDER);
        });
    };

    orderBy = order => {
        this.setState({ order: order }, () => {
            this.doLoadAdvices(order);
        });
    };

    changeTrainingSession = (trainingId, session) => {
        this.setState({ trainingId: trainingId, currentSession: session }, () => {
            this.doLoadAdvices(this.state.order);
        });

        loadAdvices(this.state.organisationId, trainingId, session, this.state.tab, this.state.order).then(result => {
            this.setState({
                advices: result.advices
            });
        });
    };

    handlePageClick = data => {
        this.setState({ pagination: { current: data.selected + 1 } }, () => {
            this.doLoadAdvices();
        });
    };

    handlePageClickWhenSelectingPlace = data => {
        this.setState({ pagination: { current: data.selected + 1 } }, () => {
            this.doLoadAllAdvices();
        });
    };

    unsetTraining = () => {
        this.setState(Object.assign(this.state, {
            trainingId: null,
        }), () => {
            this.doLoadAdvices();
        });
    };

    getActiveStatus = current => this.state.tab === current ? 'active' : '';

    render() {
        const { currentEntity, entities } = this.state.training;

        return (
            <div className="organisationPanel mainPanel">

                <Notice codeRegion={this.props.codeRegion} />

                {/*{false && <SessionStats id={this.state.organisationId} />}*/}
                <Graphes organisationId={this.state.organisationId} />
                <h2 className="advicesGestion h2">Gestion des commentaires</h2>

                <div>
                    <div className="filters">
                        <div className="row">
                            <div className="col-md-6">
                                <EntitySearchForm currentEntity={currentEntity} entities={entities}
                                    handleEntityChange={this.handleEntityChange}
                                    unsetEntity={this.unsetEntity} />
                            </div>
                            <div className="col-md-6">
                                <SearchForm id={this.state.organisationId} currentEntity={currentEntity}
                                    changeEntity={this.changeEntity} unsetTraining={this.unsetTraining}
                                    changeTrainingSession={this.changeTrainingSession} />
                            </div>
                        </div>

                        {/*A laisser en commentaire */}
                        {/*<NotesFilter />*/}

                    </div>

                    <div className="avis">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('unread')}`} onClick={this.switchTab.bind(this, 'unread')}>Nouveaux <span
                                    className="badge reported">{this.state.inventory.unread}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('reported')}`}onClick={this.switchTab.bind(this, 'reported')}>Signalés <span
                                    className="badge rejected">{this.state.inventory.reported}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('answered')}`} onClick={this.switchTab.bind(this, 'answered')}>Répondus <span
                                    className="badge published">{this.state.inventory.answered}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('read')}`} onClick={this.switchTab.bind(this, 'read')}>Lus <span
                                    className="badge toModerate">{this.state.inventory.read}</span></button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${this.getActiveStatus('all')}`} onClick={this.switchTab.bind(this, 'all')}>Toutes les notes et
                                    avis <span className="badge">{this.state.inventory.all}</span></button>
                            </li>
                        </ul>

                        <Toolbar orderBy={this.orderBy} />

                        <div className="advices">
                            {this.state.advices.length === 0 && <em>Pas d'avis pour le moment</em>}
                            {this.state.advices.map(advice =>
                                <div key={advice._id} className="advice">
                                    <div className="content">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h3 className="header">
                                                <span className="oi oi-person"></span>
                                                    {advice.pseudo}
                                                    {!advice.pseudo && <em>anonyme</em>} -&nbsp;
                                                    <FormattedDate
                                                        value={new Date(advice.date)}
                                                        day="numeric"
                                                        month="long"
                                                        year="numeric" />
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

                                                    {this.state.reply && this.state.reply.id === advice._id &&
                                                    <div className="answer">
                                                        <h4>Votre réponse</h4>

                                                        <textarea className="form-control" rows="3"
                                                            onChange={this.handleReplyChange.bind(this, advice._id)}
                                                            value={this.state.reply.text}></textarea>

                                                        <p {...this.state.reply.maxLengthReached ? { className: 'maxLengthReached' } : {}}>Il
                                                            vous
                                                            reste {MAX_LENGTH - this.state.reply.text.length} caractères
                                                            pour écrire votre réponse.</p>

                                                        <div className="actions">
                                                            <button className="btn btn-success btn-sm"
                                                                onClick={this.handleDoReply.bind(this, advice._id)}>
                                                                <span className="oi oi-comment-square"></span> Valider
                                                                la réponse
                                                            </button>
                                                            {advice.answered &&
                                                            <button className="btn btn-danger btn-sm"
                                                                onClick={this.handleRemoveReply.bind(this, advice._id)}>
                                                                <span className="oi oi-trash"></span> &Ocirc;ter
                                                                la réponse</button>}
                                                            <button className="btn btn-warning btn-sm"
                                                                onClick={this.handleCancelReply.bind(this, advice._id)}>
                                                                <span className="oi oi-comment-square"></span> Annuler
                                                            </button>
                                                        </div>
                                                    </div>
                                                    }
                                                    {(advice.answer && !this.state.reply.shown) &&
                                                    <div className="answer">
                                                        <h4>Votre réponse</h4>
                                                        <p>{advice.answer}</p>
                                                    </div>
                                                    }
                                                    {!(this.state.reply.shown === true && this.state.reply.id === advice._id) &&
                                                    <div className="actions">
                                                        {(advice.read !== true && this.state.tab !== 'reported') &&
                                                        <button className="btn btn-info btn-sm"
                                                            onClick={this.handleMarkAsRead.bind(this, advice._id)}>
                                                            <span className="oi oi-eye"></span> Marquer comme lu
                                                        </button>}
                                                        {(advice.read === true && this.state.tab !== 'reported') &&
                                                        <button className="btn btn-info btn-sm"
                                                            onClick={this.handleMarkAsNotRead.bind(this, advice._id)}>
                                                            <span className="oi oi-eye"></span> Marquer comme non
                                                            lu</button>}
                                                        {this.state.tab !== 'reported' &&
                                                        <button className="btn btn-success btn-sm"
                                                            onClick={this.handleReply.bind(this, advice._id)}
                                                            title="votre réponse à avis sera publiée sur les sites partenaires et accessible aux futurs stagiaires potentiels">
                                                            <span className="oi oi-comment-square"></span> {advice.answered ? 'Modifier la réponse' : 'Répondre'}
                                                        </button>}
                                                        {(this.state.tab !== 'reported' && advice.reported !== true) &&
                                                        <button className="btn btn-danger btn-sm"
                                                            onClick={this.handleReport.bind(this, advice._id)}
                                                            title="signaler un avis permet d'alerter le modérateur sur son non-respect potentiel de la charte de modération">
                                                            <span className="oi oi-warning"></span> Signaler
                                                        </button>}
                                                        {advice.reported === true &&
                                                        <button className="btn btn-danger btn-sm"
                                                            onClick={this.handleUnreport.bind(this, advice._id)}><span className="oi oi-warning"></span> Marquer comme non
                                                            signalé</button>}
                                                    </div>
                                                    }
                                                </div>
                                                }
                                                {!advice.comment &&
                                                <div>
                                                    <div className="noComment">Cet utilisateur n'a pas laissé d'avis.
                                                    </div>
                                                </div>
                                                }
                                            </div>
                                            <div className="col-md-3">
                                                <AdviceRates rates={advice.rates} />
                                            </div>
                                            <div className="col-md-3">
                                                <div><strong>Organisme</strong> {advice.training.organisation.name}
                                                </div>
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

                            {currentEntity && this.state.pagination.count > 1 &&
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
                            {!currentEntity && this.state.pagination.count > 1 &&
                            <ReactPaginate previousLabel={'<'}
                                nextLabel={'>'}
                                pageCount={this.state.pagination.count}
                                forcePage={this.state.pagination.current - 1}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={this.handlePageClickWhenSelectingPlace}
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
                </div>
            </div>
        );
    }
}
