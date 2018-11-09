import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

import { updateEditedEmail } from '../../../lib/organisationService';

export default class OrganisationDetail extends React.PureComponent {
    //13000285000019
    state = {
        mode: 'view',
        emailEdited: ''
    }

    propTypes = {
        organisation: PropTypes.object.isRequired,
    }

    getEmail = () => {
        let email = this.props.organisation.courriel;
        try {
            email = this.props.organisation.meta.kairosData.emailRGC;
        } catch (e) {

        }
        email = this.props.organisation.editedEmail !== undefined ? this.props.organisation.editedEmail : email;

        return email;
    }

    changeMode = mode => {
        this.setState({ mode: mode });
    }

    cancel = () => {
        this.setState({ emailEdited: '' });
        this.changeMode('view');
    }

    update = () => {
        updateEditedEmail(this.props.organisation._id, this.state.emailEdited);
        this.changeMode('view');
    }

    handleEmailChange = event => {
        this.setState({ emailEdited: event.target.value });
    }

    render() {
        return (
            <div className="organisationDetail">
                {this.props.organisation === null &&
                    <div >
                        <span className="alert alert-danger">Organisme introuvable</span>
                    </div>
                }
                {this.props.organisation &&
                    <div>
                        <h3>{this.props.organisation.raisonSociale}</h3>
                        <h4>SIRET {this.props.organisation._id}</h4>
                        <strong>Modifier l'adresse d'un Organisme de Formation</strong>
                        <div>
                            Adresse email Anotea : 
                            {this.state.mode === 'view' &&
                                <div>
                                    <span>{this.getEmail()}</span> <button className="btn btn-primary" onClick={this.changeMode.bind(this, 'edit')}>Modifier</button>
                                </div>
                            }
                            {this.state.mode === 'edit' &&
                                <div>
                                    <input type="text" value={this.state.editedEmail} onChange={this.handleEmailChange} /> <button className="btn btn-primary" onClick={this.update}>Mettre à jour</button> <button className="btn" onClick={this.cancel}>Annuler</button>
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }
}
