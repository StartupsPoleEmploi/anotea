import React from 'react';
import PropTypes from 'prop-types';
import { PaginationSummary } from '../../../../common/Pagination';
import './AvisResultsSummary.scss';

export default class AvisResultsSummary extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
    };

    render() {
        let { status } = this.props.query;
        let { pagination, stagiaire } = this.props.results.meta;
        let suffixMapper = {
            'all': '',
            'published': 'publiés',
            'rejected': 'rejetés',
            'reported': 'signalés',
            'none': 'à modérer',
        };

        if (pagination.totalItems === 0) {
            return (<p className="Description">Pas d&apos;avis pour le moment</p>);
        }

        return (
            <p className="Description">
                <span className="name">Liste des avis</span>
                <span className="status"> {stagiaire ? stagiaire.email : suffixMapper[status]}</span>
                {stagiaire &&
                <div className="identifiant">Identifiant: {stagiaire.dnIndividuNational}</div>
                }
                <span className="summary d-none d-sm-block">
                    <PaginationSummary pagination={pagination} />
                </span>
            </p>
        );
    }
}
