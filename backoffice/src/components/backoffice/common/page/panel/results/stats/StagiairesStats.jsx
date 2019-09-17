import React from 'react';
import PropTypes from 'prop-types';
import Pie from './Pie';
import './StagiairesStats.scss';

const StagiairesStats = ({ stats }) => {

    let { stagiaires, avis } = stats;

    return (
        <div className="StagiairesStats d-flex justify-content-between">
            <div>
                <div className="d-flex stats justify-content-between align-items-center mr-4">
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
            <div>
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
    );
};

StagiairesStats.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default StagiairesStats;
