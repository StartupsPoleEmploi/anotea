import React from 'react';
import PropTypes from 'prop-types';
import Pie from './Pie';
import './StagiairesStats.scss';

const StagiairesStats = ({ stats }) => {

    let { stagiaires, avis } = stats;

    let rate = stagiaires.nbEmailsEnvoyes ?
        `${Math.round((stagiaires.nbAvisDeposes / stagiaires.nbEmailsEnvoyes) * 100)}%` : '0%';

    return (
        <div className="StagiairesStats d-flex flex-wrap flex-row">
            <div className="d-flex justify-content-around align-items-stretch stats mr-3">
                <div className="data">
                    <div className="value">{stagiaires.nbEmailsEnvoyes} <i className="icon fas fa-envelope"></i></div>
                    <div className="label">Mails envoyés</div>
                </div>
                <div className="data">
                    <div className="value">{stagiaires.nbAvisDeposes} <i className="icon far fa-comment"></i></div>
                    <div className="label">Avis déposés</div>
                </div>
                <div className="data last">
                    <div className="value">{rate} <i className="icon fas fa-user-friends"></i></div>
                    <div className="label">
                        <div>des stagiaires interrogés</div>
                        <div>ont déposé un avis</div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-center stats">
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
    );
};

StagiairesStats.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default StagiairesStats;
