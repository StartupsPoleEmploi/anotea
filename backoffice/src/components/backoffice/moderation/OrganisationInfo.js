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
                    <li>Email envoyé {moment(this.props.organisation.mailSentDate).fromNow()}</li>
                    <li>Mot de passé créé : {this.props.organisation.passwordHash !== undefined ? 'oui' : 'non'}</li>
                    <li>{this.props.organisation.advicesCount} avis</li>
                </ul>
            </div>
        );
    }
}
