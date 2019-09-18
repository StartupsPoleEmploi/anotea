import React from 'react';
import PropTypes from 'prop-types';
import './CommentairesStats.scss';
import Pie from './Pie';

const CommentairesStats = ({ stats }) => {

    let { avis } = stats;

    return (
        <div className="CommentairesStats d-flex flex-wrap justify-content-start">
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
    );
};

CommentairesStats.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default CommentairesStats;
