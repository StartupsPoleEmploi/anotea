import React from 'react';
import PropTypes from 'prop-types';
import './CommentairesStats.scss';
import Pie from './Pie';

const CommentairesStats = ({ stats }) => {

    return (
        <div className="CommentairesStats d-flex flex-wrap flex-row">
            <div className="chart first">
                <div className="title">Modération des commentaires</div>
                <div className="description">Sur {stats.nbCommentaires} commentaires au total</div>
                <Pie data={[
                    {
                        'id': 'Publiés',
                        'value': stats.nbPublished,
                    },
                    {
                        'id': 'Rejetés',
                        'value': stats.nbRejected,
                    },
                ]} />
            </div>
            <div className="chart second">
                <div className="title">Commentaires publiés</div>
                <div className="description">Sur {stats.nbPublished} commentaires au total</div>
                <Pie data={[
                    {
                        'id': 'Positifs',
                        'value': stats.nbPositifs,
                    },
                    {
                        'id': 'Négatifs',
                        'value': stats.nbNegatifs,
                    },
                ]} />
            </div>
            <div className="chart last">
                <div className="title">Commentaires rejetés</div>
                <div className="description">Sur {stats.nbRejected} commentaires au total</div>
                <Pie data={[
                    {
                        'id': 'Non concernés',
                        'value': stats.nbNonConcernes,
                    },
                    {
                        'id': 'Alertes',
                        'value': stats.nbAlertes,
                    },
                    {
                        'id': 'Injures',
                        'value': stats.nbInjures,
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
