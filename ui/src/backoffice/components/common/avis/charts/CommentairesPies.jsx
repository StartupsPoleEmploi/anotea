import React from 'react';
import PropTypes from 'prop-types';
import './CommentairesPies.scss';
import Pie from '../../../common/page/panel/results/stats/Pie';

let round = value => Number(Math.round(value + 'e1') + 'e-1');

const CommentairesPies = ({ stats }) => {

    let colors = ['#007E54', '#E5F2ED', '#66B298'];
    let totalComMod = stats.nbCommentairesValidated+stats.nbCommentairesRejected+stats.nbCommentairesReported+stats.nbCommentairesArchived;
    let totalComVal = stats.nbCommentairesPositifs + stats.nbCommentairesNegatifs;
    let totalComRej = stats.nbCommentairesNonConcernes + stats.nbCommentaires + stats.nbCommentairesInjures;

    return (
        <div className="CommentairesPies">
            <h2 className="title">Les commentaires</h2>
            <div className="box d-flex flex-wrap flex-row">
                <div className="chart first" tabIndex="0">
                    <div className="title">Modération des commentaires</div>
                    <div className="description">{stats.nbCommentaires} commentaires au total</div>
                    <Pie colors={colors} data={[
                        ...(stats.nbCommentairesValidated !== 0 ?
                            [{ id:`Validés (${round((stats.nbCommentairesValidated / totalComMod) * 100)}%)`,value: stats.nbCommentairesValidated,label: 'commentaires'}] : []),
                        ...(stats.nbCommentairesRejected !== 0 ?
                            [{ id: `Rejetés (${round((stats.nbCommentairesRejected / totalComMod) * 100)}%)`, value: stats.nbCommentairesRejected, label: 'commentaires' }] : []),
                        ...(stats.nbCommentairesReported !== 0 ?
                            [{ id: `Signalés (${round((stats.nbCommentairesReported / totalComMod) * 100)}%)`, value: stats.nbCommentairesReported, label: 'commentaires' }] : []),
                        ...(stats.nbCommentairesArchived !== 0 ?
                            [{ id: `Archivés (${round((stats.nbCommentairesArchived / totalComMod) * 100)}%)`, value: stats.nbCommentairesArchived, label: 'commentaires' }] : []),
                    ]}>
                    </Pie>
                </div>
                <div className="chart second" tabIndex="0">
                    <div className="title">Commentaires validés</div>
                    <div className="description">{stats.nbCommentairesValidated} commentaires au total</div>
                    <Pie colors={colors} data={[
                        ...(stats.nbCommentairesPositifs !== 0 ?
                            [{ id: `Positifs (${round((stats.nbCommentairesPositifs / totalComVal) * 100)}%)`, value: stats.nbCommentairesPositifs, label: 'commentaires' }] : []),
                        ...(stats.nbCommentairesNegatifs !== 0 ?
                            [{ id: `Négatifs (${round((stats.nbCommentairesNegatifs / totalComVal) * 100)}%)`, value: stats.nbCommentairesNegatifs, label: 'commentaires' }] : []),
                    ]} />
                </div>
                <div className="chart last" tabIndex="0">
                    <div className="title">Commentaires rejetés</div>
                    <div className="description">{stats.nbCommentairesRejected} commentaires au total</div>
                    <Pie colors={colors} data={[
                        ...(stats.nbCommentairesNonConcernes !== 0 ?
                            [{ id: `Non concernés (${round((stats.nbCommentairesNonConcernes / totalComRej) * 100)}%)`, value: stats.nbCommentairesNonConcernes, label: 'commentaires' }] : []),
                        ...(stats.nbCommentairesAlertes !== 0 ?
                            [{ id: `Alertes (${round((stats.nbCommentairesAlertes / totalComRej) * 100)}%)`, value: stats.nbCommentairesAlertes, label: 'commentaires' }] : []),
                        ...(stats.nbCommentairesInjures !== 0 ?
                            [{ id: `Injures (${round((stats.nbCommentairesInjures / totalComRej) * 100)}%)`, value: stats.nbCommentairesInjures, label: 'commentaires' }] : []),
                    ]} />
                </div>
            </div>
        </div>
    );
};

CommentairesPies.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default CommentairesPies;
