import React from 'react';
import PropTypes from 'prop-types';
import Pie from '../../common/page/panel/results/stats/Pie';
import './StagiairesStats.scss';

const StagiairesStats = ({ stagiaires, avis }) => {

    let rate = stagiaires.nbEmailsEnvoyes ?
        `${Math.round((avis.total / stagiaires.nbEmailsEnvoyes) * 100)}%` : '0%';

    return (
        <div className="StagiairesStats">
            <div className="title">Les avis et les commentaires</div>
            <div className="d-flex flex-wrap flex-row">
                <div className="d-flex justify-content-around align-items-stretch stats mr-3">
                    <div className="data">
                        <div className="value">{avis.total || 0} <i className="icon far fa-comment"></i></div>
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
                <div className="d-flex justify-content-center stats mt-md-3 mt-lg-0">
                    <div className="chart">
                        <div className="title">Dépôt d&apos;avis</div>
                        <Pie
                            colors={['#F28017', '#F7B374', '#FDF2E7']}
                            data={[
                                {
                                    'id': 'Commentaires',
                                    'value': avis.nbCommentaires,
                                },
                                {
                                    'id': 'Notes seules',
                                    'value': avis.nbNotesSeules,
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

StagiairesStats.propTypes = {
    avis: PropTypes.object.isRequired,
    stagiaires: PropTypes.object.isRequired,
};

export default StagiairesStats;
