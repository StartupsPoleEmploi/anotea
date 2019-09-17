import React from 'react';
import PropTypes from 'prop-types';
import Pie from './Pie';
import NoteDetails from './NoteDetails';
import './StatsResults.scss';

const StatsResults = ({ stats }) => {

    let { avis, stagiaires } = stats;
    return (
        <div className="StatsResults">
            <div className="row">
                <div className="col-sm-12">
                    <div className="stats-title">Campagne Anotéa</div>
                </div>
                <div className="col-sm-8">
                    <div className="d-flex stats justify-content-between align-items-center">
                        <div className="data">
                            <div className="value">{stagiaires.nbEmailsEnvoyes} <i className="icon fas fa-envelope"></i></div>
                            <div className="label">Mails envoyés</div>
                        </div>
                        <div className="data">
                            <div className="value">{stagiaires.nbAvisDeposes} <i className="icon far fa-comment"></i></div>
                            <div className="label">Avis déposés</div>
                        </div>
                        <div className="data last">
                            <div className="value">3 <i className="icon fas fa-user-friends"></i></div>
                            <div className="label">des stagiaires interrogés ont déposé un avis</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className="d-flex justify-content-between stats">
                        <div className="chart">
                            <div className="title">Dépôt d'avis</div>
                            <Pie data={[
                                {
                                    'id': 'Commentaires',
                                    'value': avis.nbCommentaires,
                                },
                                {
                                    'id': 'Notes seules',
                                    'value': avis.nbNotesSeules,
                                },
                            ]} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <div className="stats-title">Les commentaires</div>
                    <div className="d-flex justify-content-between stats">
                        <div className="chart first">
                            <div className="title">Modération des commentaires</div>
                            <div className="description">Sur {avis.nbCommentaires} commentaires au total</div>
                            <Pie data={[
                                {
                                    'id': 'Publiés',
                                    'value': avis.nbPublished,
                                },
                                {
                                    'id': 'Rejetés',
                                    'value': avis.nbRejected,
                                },
                            ]} />
                        </div>
                        <div className="chart second">
                            <div className="title">Commentaires publiés</div>
                            <div className="description">Sur {avis.nbCommentaires} commentaires au total</div>
                            <Pie data={[
                                {
                                    'id': 'Positifs',
                                    'value': avis.nbPositifs,
                                },
                                {
                                    'id': 'Négatifs',
                                    'value': avis.nbNegatifs,
                                },
                            ]} />
                        </div>
                        <div className="chart last">
                            <div className="title">Commentaires rejetés</div>
                            <div className="description">Sur {avis.nbCommentaires} commentaires au total</div>
                            <Pie data={[
                                {
                                    'id': 'Non concernés',
                                    'value': avis.nbNonConcernes,
                                },
                                {
                                    'id': 'Négatifs',
                                    'value': avis.nbNegatifs,
                                },
                                {
                                    'id': 'Injures',
                                    'value': avis.nbInjures,
                                },
                            ]} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <div className="stats-title">Les notes</div>
                    <NoteDetails notes={avis.notes} total={avis.total} />
                </div>
            </div>
        </div>

    );
};

StatsResults.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default StatsResults;
