import React                from 'react';
import { FormattedDate }    from 'react-intl';
import ReactPaginate        from 'react-paginate';

import Toolbar              from '../common/Toolbar';
import AdviceRates          from '../common/adviceRates';
import TrainingInfo         from './TrainingInfo';
import CommentOwnerInfo     from './CommentOwnerInfo';
import {
    loadAdvices,
    loadInventory,
    rejectAdvice,
    publishAdvice,
    updateAdvice,
    maskPseudo,
    unmaskPseudo,
    maskTitle,
    unmaskTitle,
    loadOfResponses,
    loadOfInventory,
} from '../../../lib/adviceService';

const DEFAULT_ORDER = 'moderation';

export default class ModerationPanel extends React.Component {

    state = {};

    constructor(props) {
        super(props);

        this.state = {
            moderationTarget: 'stagiaires',
            advices: [],
            currentEdit: null,
            tab: 'toModerate',
            inventory: {
                reported: 0,
                toModerate: 0,
                rejected: 0,
                published: 0,
                all: 0
            },
            pagination: {
                current: null,
                count: null
            },
            order: DEFAULT_ORDER
        };
        this.doLoadAdvices();
    };

    doLoadAdvices = async (filter = this.state.tab, order = this.state.order, codeRegion = this.props.codeRegion, page = this.state.pagination.current) => {
        this.doLoadInventory(codeRegion);
        const result = await loadAdvices(filter, order, codeRegion, page);
        this.setState({
            pagination: { current: result.page, count: result.pageCount },
            advices: result.advices.map(advice => {
                advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                return advice;
            })
        });
        this.forceUpdate();
    };

    doLoadOfResponses = async (filter = this.state.tab, order = this.state.order, codeRegion = this.props.codeRegion, page = this.state.pagination.current) => {
        this.doLoadOfInventory(codeRegion);
        const result = await loadOfResponses(filter, order, codeRegion, page);
        this.setState({
            pagination: { current: result.page, count: result.pageCount },
            advices: result.advices.map(advice => {
                advice.comment.text = advice.editedComment ? advice.editedComment.text : advice.comment.text;
                return advice;
            })
        });
        this.forceUpdate();
    };

    doLoadInventory = async (codeRegion = this.props.codeRegion) => {
        const inventory = await loadInventory(codeRegion);
        this.setState({ inventory: inventory });
    };

    doLoadOfInventory = async (codeRegion = this.props.codeRegion) => {
        const inventory = await loadOfInventory(codeRegion);
        this.setState({ inventory: inventory });
    };

    handleReject = (id, reason, evt) => {
        rejectAdvice(id, reason).then(result =>
            this.doLoadAdvices()
        );
    };

    handlePublish = (id, qualification, evt) => {
        publishAdvice(id, qualification).then(result =>
            this.doLoadAdvices()
        );
    };

    handleEdit = (id, evt) => {
        this.setState({
            currentEdit: {
                id: id
            },
            currentEditBackup: null
        });
    };

    handleChange = (id, evt) => {
        if (this.state.currentEditBackup === null) {
            this.state.advices.map(advice => {
                if (advice._id === id) {

                    this.setState({ currentEditBackup: advice.comment.text });
                }
            });
        }
        this.setState({
            advices: this.state.advices.map(advice => {
                if (advice._id === id) {
                    advice.comment.text = evt.target.value;
                }
                return advice;
            }),
            currentEdit: { id: id, newValue: evt.target.value }
        });
    };

    handleUpdate = (id, qualification, evt) => {
        this.setState({ currentEdit: null });
        updateAdvice(id, this.state.currentEdit.newValue, qualification).then(result =>
            this.doLoadAdvices()
        );
    };

    handleCancel = (id, evt) => {
        const backup = this.state.currentEditBackup;
        this.setState({
            advices: this.state.advices.map(advice => {
                if (advice._id === id && backup != null) {
                    advice.comment.text = backup;
                }
                return advice;
            }),
            currentEdit: null
        });
    };

    switchTab = tab => {
        this.setState({ tab: tab, pagination: { current: null, count: null } }, () => {
            if (tab === 'toModerate') {
                this.orderBy('creation');
            } else {
                this.orderBy(DEFAULT_ORDER);
            }
        });
    };

    orderBy = order => {
        this.setState({ order: order }, () => {
            if (this.state.moderationTarget === 'stagiaires') {
                this.doLoadAdvices();
            } if (this.state.moderationTarget === 'organismeFormation') {
                this.doLoadOfResponses();
            }
        });
    };

    handlePageClick = data => {
        this.setState({ pagination: { current: data.selected + 1 } }, () => {
            if (this.state.moderationTarget === 'stagiaires') {
                this.doLoadAdvices();
            } if (this.state.moderationTarget === 'organismeFormation') {
                this.doLoadOfResponses();
            }
        });
    };

    switchMaskPseudo = (id, status) => {
        this.setState({
            advices: this.state.advices.map(advice => {
                if (advice._id === id) {
                    advice.pseudoMasked = status;
                }
                return advice;
            })
        });
    };

    switchMaskTitle = (id, status) => {
        this.setState({
            advices: this.state.advices.map(advice => {
                if (advice._id === id) {
                    advice.titleMasked = status;
                }
                return advice;
            })
        });
    };

    handleMaskPseudo = (id, evt) => {
        maskPseudo(id).then(result => {
            this.switchMaskPseudo(id, true);
        });
    };

    handleUnmaskPseudo = (id, evt) => {
        unmaskPseudo(id).then(result => {
            this.switchMaskPseudo(id, false);
        });
    };

    handleMaskTitle = (id, evt) => {
        maskTitle(id).then(result => {
            this.switchMaskTitle(id, true);
        });
    };

    handleUnmaskTitle = (id, evt) => {
        unmaskTitle(id).then(result => {
            this.switchMaskTitle(id, false);
        });
    };

    moderateStagiairesAdvices = () => {
        this.setState({
            moderationTarget : 'stagiaires',
            tab: 'toModerate',
        }, () => {
            this.doLoadAdvices();
        });
    };

    moderateOfAdvices = () => {
        this.setState({
            moderationTarget : 'organismeFormation',
            tab: 'all',
        }, () => {
            this.doLoadOfResponses();
        });
    };

    render() {
        return (
            <div className="moderationPanel mainPanel">
                <h1>Panneau de modération</h1>

                <div className="filters">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="actionToModerate">
                                <div>
                                    <button type="button" className="stagiaires" onClick={this.moderateStagiairesAdvices.bind(this)}>Stagiaires</button>
                                </div>
                                &nbsp;
                                <div>
                                    <button type="button" className="of" onClick={this.moderateOfAdvices.bind(this)}>Organismes de formations</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-10">
                            <h2>Liste des avis</h2>


                            <ul className="nav nav-tabs">
                                {this.state.moderationTarget === 'organismeFormation' &&
                                <li role="presentation" {...this.state.tab === 'reported' ? {className: 'active'} : {}}>
                                    <a role="button" onClick={this.switchTab.bind(this, 'reported')}>Signalés <span
                                        className="badge reported">{this.state.inventory.reported}</span></a>
                                </li>
                                }
                                <li role="presentation" {...this.state.tab === 'toModerate' ? { className: 'active' } : {}}>
                                    <a role="button" onClick={this.switchTab.bind(this, 'toModerate')}>&Agrave; modérer <span
                                        className="badge toModerate">{this.state.inventory.toModerate}</span></a>
                                </li>
                                <li role="presentation" {...this.state.tab === 'rejected' ? { className: 'active' } : {}}>
                                    <a role="button" onClick={this.switchTab.bind(this, 'rejected')}>Rejetés <span
                                        className="badge rejected">{this.state.inventory.rejected}</span></a>
                                </li>
                                <li role="presentation" {...this.state.tab === 'published' ? { className: 'active' } : {}}>
                                    <a role="button" onClick={this.switchTab.bind(this, 'published')}>Publiés <span
                                        className="badge published">{this.state.inventory.published}</span></a>
                                </li>
                                <li role="presentation" {...this.state.tab === 'all' ? { className: 'active' } : {}}>
                                    <a role="button" onClick={this.switchTab.bind(this, 'all')}>Tous les avis <span
                                        className="badge">{this.state.inventory.all}</span></a>
                                </li>
                            </ul>

                            <Toolbar orderBy={this.orderBy} currentTab={this.state.tab} />

                            {this.state.moderationTarget === 'stagiaires' &&
                            <div className="advices">
                                {(this.state.advices.length === 0) && <span>Pas d'avis pour le moment</span>}
                                {this.state.advices.filter(advice => advice.comment).map((advice, key) =>
                                    <div key={key} className="advice">
                                        <div className="row">
                                            <div className="col-md-6">

                                                <CommentOwnerInfo advice={advice}/>

                                                {/*<h3>*/}
                                                    {/*<i className="avatar glyphicon glyphicon-user"></i>*/}

                                                    {/*<div className="pseudo">*/}
                                                        {/*<span>*/}
                                                            {/*{advice.pseudoMasked !== true && <span>{advice.pseudo}</span>}*/}
                                                            {/*{advice.pseudoMasked === true && <em>{advice.pseudo}</em>}*/}
                                                            {/*{advice.pseudoMasked !== true && <small*/}
                                                                {/*onClick={this.handleMaskPseudo.bind(this, advice._id)}>affiché</small>}*/}
                                                            {/*{advice.pseudoMasked === true && <small*/}
                                                                {/*onClick={this.handleUnmaskPseudo.bind(this, advice._id)}>masqué</small>}*/}
                                                        {/*</span>*/}
                                                    {/*</div>*/}
                                                    {/*-&nbsp;*/}
                                                    {/*<FormattedDate*/}
                                                        {/*value={new Date(advice.date)}*/}
                                                        {/*day="numeric"*/}
                                                        {/*month="long"*/}
                                                        {/*year="numeric"/>*/}
                                                    {/*{((this.state.tab === 'all' && advice.published) || advice.published) &&*/}
                                                    {/*<span*/}
                                                        {/*className="badge published">Publié ({advice.qualification}) le <FormattedDate*/}
                                                        {/*value={new Date(advice.lastModerationAction)}*/}
                                                        {/*day="numeric"*/}
                                                        {/*month="numeric"*/}
                                                        {/*year="numeric"/></span>*/}
                                                    {/*}*/}
                                                    {/*{((this.state.tab === 'all' && advice.rejected) || advice.rejected) &&*/}
                                                    {/*<span*/}
                                                        {/*className="badge rejected">Rejeté ({advice.rejectReason}) le <FormattedDate*/}
                                                        {/*value={new Date(advice.lastModerationAction)}*/}
                                                        {/*day="numeric"*/}
                                                        {/*month="numeric"*/}
                                                        {/*year="numeric"/></span>*/}
                                                    {/*}*/}
                                                    {/*{(this.state.tab === 'all' && advice.moderated !== true) &&*/}
                                                    {/*<span className="badge toModerate">&Agrave; modérer</span>*/}
                                                    {/*}*/}
                                                    {/*{(this.state.tab === 'all' && advice.reported) &&*/}
                                                    {/*<span className="badge reported">Signalé</span>*/}
                                                    {/*}*/}
                                                {/*</h3>*/}

                                                <h4 className="title">
                                                    {advice.titleMasked !== true && <span>{advice.comment.title}</span>}
                                                    {advice.titleMasked === true && <em>{advice.comment.title}</em>}
                                                    {advice.titleMasked !== true &&
                                                    <small
                                                        onClick={this.handleMaskTitle.bind(this, advice._id)}>affiché</small>}
                                                    {advice.titleMasked === true &&
                                                    <small
                                                        onClick={this.handleUnmaskTitle.bind(this, advice._id)}>masqué</small>}
                                                </h4>
                                                {(this.state.currentEdit === null || this.state.currentEdit.id !== advice._id) &&
                                                <div>
                                                    <p>{advice.comment.text}</p>
                                                    <div className="actions">
                                                        {!advice.rejected && <div className="dropdown">
                                                            <button
                                                                className="btn btn-default dropdown-toggle btn-danger btn-xs"
                                                                type="button" id="dropdownMenu1" data-toggle="dropdown"
                                                                aria-haspopup="true" aria-expanded="true">
                                                                <i className="glyphicon glyphicon-ban-circle"></i> Rejeter
                                                            </button>
                                                            <ul className="dropdown-menu"
                                                                aria-labelledby="dropdownMenu1">
                                                                <li className="dropdown-header">Motif de rejet</li>
                                                                <li><a
                                                                    onClick={this.handleReject.bind(this, advice._id, 'injure')}
                                                                    role="button">Injure</a></li>
                                                                <li><a
                                                                    onClick={this.handleReject.bind(this, advice._id, 'alerte')}
                                                                    role="button">Alerte</a></li>
                                                                <li><a
                                                                    onClick={this.handleReject.bind(this, advice._id, 'non concerné')}
                                                                    role="button">Non concerné</a></li>
                                                            </ul>
                                                        </div>}

                                                        {(!advice.published || this.state.tab === 'reported') &&
                                                        <div className="dropdown">
                                                            <button
                                                                className="btn btn-default dropdown-toggle btn-success btn-xs"
                                                                type="button" id="dropdownMenu1" data-toggle="dropdown"
                                                                aria-haspopup="true" aria-expanded="true">
                                                                <i className="glyphicon glyphicon-ok-circle"></i> Publier
                                                            </button>
                                                            <ul className="dropdown-menu"
                                                                aria-labelledby="dropdownMenu1">
                                                                <li className="dropdown-header">Qualification</li>
                                                                <li><a
                                                                    onClick={this.handlePublish.bind(this, advice._id, 'négatif')}
                                                                    role="button">Négatif</a></li>
                                                                <li><a
                                                                    onClick={this.handlePublish.bind(this, advice._id, 'positif')}
                                                                    role="button">Positif ou neutre</a></li>
                                                                <li><a
                                                                    onClick={this.handlePublish.bind(this, advice._id, 'pe')}
                                                                    role="button">PE</a></li>
                                                                <li><a
                                                                    onClick={this.handlePublish.bind(this, advice._id, 'of')}
                                                                    role="button">OF</a></li>
                                                                <li><a
                                                                    onClick={this.handlePublish.bind(this, advice._id, 'cr')}
                                                                    role="button">CR</a></li>
                                                            </ul>
                                                        </div>}

                                                        <button className="btn btn-primary btn-xs"
                                                                onClick={this.handleEdit.bind(this, advice._id)}>
                                                            <i className="glyphicon glyphicon-edit"></i> Modifier
                                                        </button>
                                                    </div>
                                                </div>
                                                }
                                                {this.state.currentEdit && this.state.currentEdit.id === advice._id &&
                                                <div>
                                        <textarea type="text" className="form-control"
                                                  onChange={this.handleChange.bind(this, advice._id)}
                                                  value={advice.comment.text}/>
                                                    <div className="actions">
                                                        <div className="dropdown">
                                                            <button {...this.state.currentEdit.newValue === undefined ? {disabled: 'disabled'} : {}}
                                                                    className="btn btn-default dropdown-toggle btn-success btn-xs"
                                                                    type="button" id="dropdownMenu1"
                                                                    data-toggle="dropdown"
                                                                    aria-haspopup="true" aria-expanded="true">
                                                                <i className="glyphicon glyphicon-ok-circle"></i> Valider
                                                                et Publier
                                                            </button>
                                                            <ul className="dropdown-menu"
                                                                aria-labelledby="dropdownMenu1">
                                                                <li className="dropdown-header">Qualification</li>
                                                                <li><a
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'négatif')}
                                                                    role="button">Négatif</a></li>
                                                                <li><a
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'positif')}
                                                                    role="button">Positif ou neutre</a></li>
                                                                <li><a
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'pe')}
                                                                    role="button">PE</a></li>
                                                                <li><a
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'of')}
                                                                    role="button">OF</a></li>
                                                                <li><a
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'cr')}
                                                                    role="button">CR</a></li>
                                                            </ul>
                                                        </div>

                                                        <button className="btn btn-danger btn-xs"
                                                                onClick={this.handleCancel.bind(this, advice._id)}><i
                                                            className="glyphicon glyphicon-ban-circle"/> Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                                }
                                            </div>

                                            <div className="col-md-3">
                                                <AdviceRates rates={advice.rates}/>
                                            </div>

                                            <TrainingInfo training={advice.training}/>

                                        </div>
                                    </div>)}
                            </div>
                            }

                            {this.state.moderationTarget === 'organismeFormation' &&
                            <div className="advices">
                                {(this.state.advices.length === 0) && <span>Pas d'avis pour le moment</span>}
                                {this.state.advices.filter(advice => advice.answer).map((advice, key) =>
                                    <div key={key} className="advice">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h3>
                                                    <i className="avatar glyphicon glyphicon-education"/>

                                                    <div className="pseudo">
                                                        <span>
                                                            {advice.training.organisation.name !== null &&
                                                            <span>{advice.training.organisation.name}</span>}
                                                        </span>
                                                    </div>
                                                    &nbsp;-&nbsp;
                                                    <FormattedDate
                                                    value={new Date(advice.answer.date)}
                                                    day="numeric"
                                                    month="long"
                                                    year="numeric"/>
                                                    {((this.state.tab === 'all' && advice.answer.published) || advice.answer.published) &&
                                                    <span
                                                        className="badge published">Publié ({advice.qualification}) le <FormattedDate
                                                        value={new Date(advice.lastModerationAction)}
                                                        day="numeric"
                                                        month="numeric"
                                                        year="numeric"/>
                                                    </span>
                                                    }
                                                    {((this.state.tab === 'all' && advice.answer.rejected) || advice.answer.rejected) &&
                                                    <span
                                                        className="badge rejected">Rejeté ({advice.rejectReason}) le <FormattedDate
                                                        value={new Date(advice.lastModerationAction)}
                                                        day="numeric"
                                                        month="numeric"
                                                        year="numeric"/>
                                                    </span>
                                                    }
                                                    {(this.state.tab === 'all' && advice.answer.moderated !== true) &&
                                                    <span className="badge toModerate">&Agrave; modérer</span>
                                                    }
                                                    {(this.state.tab === 'all' && advice.answer.reported) &&
                                                    <span className="badge reported">Signalé</span>
                                                    }
                                                </h3>
                                                {(this.state.currentEdit === null || this.state.currentEdit.id !== advice._id) &&
                                                <div>
                                                    <p>{advice.answer.text}</p>
                                                    <div className="actions">
                                                        {!advice.answer.rejected && <div className="dropdown">
                                                            <button
                                                                className="btn btn-default dropdown-toggle btn-danger btn-xs"
                                                                type="button"
                                                                onClick={this.handleReject.bind(this, advice._id, 'injure')}>
                                                                <i className="glyphicon glyphicon-ban-circle"/> Rejeter
                                                            </button>
                                                        </div>}

                                                        {(!advice.answer.published || this.state.tab === 'reported') &&
                                                        <div className="dropdown">
                                                            <button
                                                                className="btn btn-default dropdown-toggle btn-success btn-xs"
                                                                type="button"
                                                                onClick={this.handlePublish.bind(this, advice._id, 'négatif')}>
                                                                <i className="glyphicon glyphicon-ok-circle"/> Publier
                                                            </button>
                                                        </div>}

                                                        <button className="btn btn-primary btn-xs"
                                                                onClick={this.handleEdit.bind(this, advice._id)}>
                                                            <i className="glyphicon glyphicon-edit"/> Modifier
                                                        </button>
                                                    </div>
                                                </div>
                                                }
                                                {this.state.currentEdit && this.state.currentEdit.id === advice._id &&
                                                <div>
                                                <textarea type="text"
                                                          className="form-control"
                                                          onChange={this.handleChange.bind(this, advice._id)}
                                                          value={advice.comment.text}/>
                                                    <div className="actions">
                                                        <div className="dropdown">
                                                            <button {...this.state.currentEdit.newValue === undefined ? {disabled: 'disabled'} : {}}
                                                                    className="btn btn-default dropdown-toggle btn-success btn-xs"
                                                                    type="button"
                                                                    onClick={this.handleUpdate.bind(this, advice._id, 'négatif')}>
                                                                <i className="glyphicon glyphicon-ok-circle"/> Valider
                                                                et Publier
                                                            </button>
                                                        </div>

                                                        <button className="btn btn-danger btn-xs"
                                                                onClick={this.handleCancel.bind(this, advice._id)}><i
                                                            className="glyphicon glyphicon-ban-circle"/> Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                                }
                                            </div>

                                            <TrainingInfo training={advice.training}/>

                                        </div>
                                    </div>
                                )}
                            </div>
                            }
                            {this.state.pagination.count > 1 &&
                            <ReactPaginate previousLabel={'<'}
                                           nextLabel={'>'}
                                           breakLabel={<a href="">...</a>}
                                           breakClassName={'break-me'}
                                           pageCount={this.state.pagination.count}
                                           forcePage={this.state.pagination.current - 1}
                                           marginPagesDisplayed={2}
                                           pageRangeDisplayed={5}
                                           onPageChange={this.handlePageClick}
                                           containerClassName={'pagination'}
                                           subContainerClassName={'pages pagination'}
                                           activeClassName={'active'}
                                           disableInitialCallback={true}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
