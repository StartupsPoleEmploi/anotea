import React from 'react';
import PropTypes from 'prop-types';
import { PaginationSummary } from '../../../../common/Pagination';
import './AvisResultsSummary.scss';

export default class ReponseResultsSummary extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
    };

    render() {
        let { reponseStatus } = this.props.query;
        let { pagination } = this.props.results.meta;
        let responseStatusMapper = {
            'all': '',
            'published': 'publiées',
            'rejected': 'rejetées',
            'reported': 'signalées',
            'none': 'à modérer',
        };

        if (pagination.totalItems === 0) {
            return (
                <p className="Description">Pas de réponses pour le moment</p>
            );
        }

        return (
            <p className="Description">
                <span className="name">Liste des réponses </span>
                <span className="status">{responseStatusMapper[reponseStatus]}</span>
                <span className="summary d-none d-sm-block">
                    <PaginationSummary pagination={pagination} />
                </span>
            </p>
        );
    }
}
