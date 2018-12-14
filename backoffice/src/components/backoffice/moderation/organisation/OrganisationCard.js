import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { resendEmailAccount, updateEditedCourriel } from '../../../../lib/organisationService';

export default class OrganisationCard extends React.PureComponent {

    static propTypes = {
        organisation: PropTypes.object.isRequired,
        reloadOrganisation: PropTypes.func.isRequired,
        showMessage: PropTypes.func.isRequired,
    };

    state = {
        newEditedCourriel: '',
        editMode: false,
        resendDisabled: false,
    };

    constructor(props) {
        super(props);
        this.state.newEditedCourriel = '';
        this.state.organisation = this.props.organisation;
    }

    updateCourriel = async () => {
        try {
            await updateEditedCourriel(this.props.organisation._id, this.state.newEditedCourriel);
            this.setState({ editMode: false });
            this.props.showMessage('success', 'Adresse email mise à jour avec succès.');
            this.props.reloadOrganisation();
        } catch (e) {
            console.log(e);
            this.props.showMessage('danger', 'Une erreur est survenue.');
        }
    };

    resendCourriel = async () => {
        try {
            this.setState({ resendDisabled: true });
            await resendEmailAccount(this.props.organisation._id);
            this.props.showMessage('success', 'Email envoyé avec succès.');
            this.props.reloadOrganisation();
            setTimeout(() => this.setState({ resendDisabled: false }), 10000);
        } catch (e) {
            console.log(e);
            this.props.showMessage('danger', 'Une erreur est survenue.');
        }
    };

    getActiveCourriel = () => {
        return this.props.organisation.editedCourriel ||
            this.props.organisation.kairosCourriel ||
            this.props.organisation.courriel;
    };

    getInactivesCourriels = () => {
        let inactives = [
            this.props.organisation.editedCourriel,
            this.props.organisation.kairosCourriel,
            this.props.organisation.courriel
        ]
        .filter(email => email && email !== this.getActiveCourriel())
        .filter((email, index, self) => self.indexOf(email) === index)
        .join(' / ');
        return inactives.length === 0 ? 'Aucune' : inactives;
    };

    getLastSentDate = () => {
        if (this.props.organisation.mailSentDate) {
            return moment(this.props.organisation.mailSentDate).fromNow();
        }
        return 'Non envoyé';
    };

    CourrielEditInput = () => {
        if (!this.state.editMode) {
            return (<span><b> {this.getActiveCourriel()}</b></span>);
        }
        return (
            <span>
                <input
                    type="text"
                    value={this.state.newEditedCourriel}
                    style={{ marginLeft: '10px' }}
                    onChange={event => {
                        return this.setState({ newEditedCourriel: event.target.value });
                    }} />

                <button
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: '10px' }}
                    onClick={() => this.updateCourriel()}>
                    <span className="fas fa-check" /> Mettre à jour
                </button>

                <button
                    className="btn"
                    onClick={() => this.setState({ editMode: false })}>
                    Annuler
                </button>
            </span>
        );
    };

    render() {
        return (
            <div className="card">
                <h5 className="card-header">{this.props.organisation.raisonSociale}</h5>
                <div className="card-body">
                    <div className="card-text">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">SIRET : {this.props.organisation._id}</li>
                            <li className="list-group-item">Mot de passé créé
                                : {this.props.organisation.accountCreated ? 'Oui' : 'Non'}</li>
                            <li className="list-group-item">
                                Nombre d'avis : {this.props.organisation.score.nb_avis}
                            </li>
                            <li className="list-group-item">Adresse emails inactives
                                : {this.getInactivesCourriels()}</li>
                            <li className="list-group-item">Date d'envoi du dernier email
                                : {this.getLastSentDate()}</li>
                            <li className="list-group-item">

                                <span>Adresse email active :</span>
                                {this.CourrielEditInput()}
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="card-footer">
                    <button
                        className="btn btn-secondary card-link"
                        style={{ marginLeft: '10px' }}
                        onClick={() => this.setState({ editMode: true })}>
                        Modifier l'adresse Anotéa
                    </button>
                    <button
                        className="btn btn-primary card-link"
                        disabled={this.state.resendDisabled}
                        style={{ marginLeft: '10px' }}
                        onClick={() => this.resendCourriel()}>
                        Renvoyer le lien de connexion
                    </button>
                </div>
            </div>
        );
    }
}
