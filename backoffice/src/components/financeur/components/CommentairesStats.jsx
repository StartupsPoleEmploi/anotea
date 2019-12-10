import React from 'react';
import PropTypes from 'prop-types';
import './CommentairesStats.scss';
import Pie from '../../common/page/panel/results/stats/Pie';

const CommentairesStats = ({ stats }) => {

    return (
        <div className="CommentairesStats d-flex flex-wrap flex-row">
            <div className="chart first">
                <div className="title">Modération des commentaires</div>
                <div className="description">{stats.nbCommentaires} commentaires au total</div>
                <Pie data={[
                    {
                        id: 'Validés',
                        value: stats.nbCommentairesValidated,
                        label: 'commentaires',
                    },
                    {
                        id: 'Rejetés',
                        value: stats.nbCommentairesRejected,
                        label: 'commentaires',
                    },
                    {
                        id: 'Signalés',
                        value: stats.nbCommentairesReported,
                        label: 'commentaires',
                    },
                    {
                        id: 'Archivés',
                        value: stats.nbCommentairesArchived,
                        label: 'commentaires',
                    },
                ]} />
            </div>
            <div className="chart second">
                <div className="title">Commentaires validés</div>
                <div className="description">{stats.nbCommentairesValidated} commentaires au total</div>
                <Pie data={[
                    {
                        id: 'Positifs',
                        value: stats.nbCommentairesPositifs,
                        label: 'commentaires',
                    },
                    {
                        id: 'Négatifs',
                        value: stats.nbCommentairesNegatifs,
                        label: 'commentaires',
                    },
                ]} />
            </div>
            <div className="chart last">
                <div className="title">Commentaires rejetés</div>
                <div className="description">{stats.nbCommentairesRejected} commentaires au total</div>
                <Pie data={[
                    {
                        id: 'Non concernés',
                        value: stats.nbCommentairesNonConcernes,
                        label: 'commentaires',
                    },
                    {
                        id: 'Alertes',
                        value: stats.nbCommentairesAlertes,
                        label: 'commentaires',
                    },
                    {
                        id: 'Injures',
                        value: stats.nbCommentairesInjures,
                        label: 'commentaires',
                    },
                ]} />
            </div>
        </div>
    );
};

CommentairesStats.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default CommentairesStats;
