import React from 'react';
import PropTypes from 'prop-types';
import { PaginationStatus } from '../../common/Pagination';
import './Summary.scss';

export default class Summary extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
    };

    render() {
        let { filter } = this.props.query;
        let { pagination, stagiaire } = this.props.results.meta;
        let suffixMapper = {
            'all': '',
            'published': 'publiés',
            'rejected': 'rejetés',
            'reported': 'signalés',
            'toModerate': 'à modérer',
        };

        if (pagination.totalItems === 0) {
            return (<p className="Description">Pas d&apos;avis pour le moment</p>);
        }

        return (
            <p className="Description">
                <span className="name">Liste des avis</span>
                <span className="filter"> {stagiaire ? stagiaire.email : suffixMapper[filter]}</span>
                {stagiaire &&
                <div className="identifiant">Identifiant: {stagiaire.dnIndividuNational}</div>
                }
                <span className="status d-none d-sm-block">
                    <PaginationStatus pagination={pagination} />
                </span>
            </p>
        );
    }
}
