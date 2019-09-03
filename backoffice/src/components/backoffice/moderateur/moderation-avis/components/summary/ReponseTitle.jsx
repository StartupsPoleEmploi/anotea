import React from 'react';
import PropTypes from 'prop-types';
import './AvisTitle.scss';

export default class ReponseTitle extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
    };

    render() {
        let { reponseStatus } = this.props.query;
        let responseStatusMapper = {
            'all': '',
            'published': 'publiées',
            'rejected': 'rejetées',
            'reported': 'signalées',
            'none': 'à modérer',
        };

        return (
            <p className="ReponseTitle">
                <span className="name">Liste des réponses </span>
                <span className="type">{responseStatusMapper[reponseStatus]}</span>
            </p>
        );
    }
}
