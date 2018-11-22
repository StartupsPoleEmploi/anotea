import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

export default class OrganisationInfo extends React.Component {

    static propTypes = {
        organisation: PropTypes.object.isRequired
    }

    render() {
        return (
            <div className="organisationInfo">
                <ul>
                    <li>
                        { this.props.organisation.mailSentDate && <span>Email envoyé {moment(this.props.organisation.mailSentDate).fromNow()}</span>}
                        { !this.props.organisation.mailSentDate && <span>Email non envoyé</span> }
                    </li>
                    <li>Mot de passé créé : {this.props.organisation.passwordHash !== undefined ? 'oui' : 'non'}</li>
                    <li>{this.props.organisation.advicesCount ? this.props.organisation.advicesCount : 'aucun'} avis</li>
                </ul>
            </div>
        );
    }
}
