import React from 'react';
import PropTypes from 'prop-types';
import './AvisTitle.scss';

export default class AvisTitle extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
    };

    render() {
        let { status } = this.props.query;
        let { stagiaire } = this.props.results.meta;
        let suffixMapper = {
            'all': '',
            'published': 'publiés',
            'rejected': 'rejetés',
            'reported': 'signalés',
            'none': 'à modérer',
        };

        return (
            <div className="AvisTitle">
                <span className="name">Liste des avis </span>
                <span className="type"> {stagiaire ? stagiaire.email : suffixMapper[status]}</span>
                {stagiaire &&
                <div className="identifiant">Identifiant: {stagiaire.dnIndividuNational}</div>
                }
            </div>
        );
    }
}
