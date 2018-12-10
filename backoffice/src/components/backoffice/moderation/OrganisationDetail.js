import React from 'react';
import PropTypes from 'prop-types';

import './organisationDetail.css';

import Email from './Email';

import OrganisationInfo from './OrganisationInfo';

import { resendEmailAccount } from '../../../lib/organisationService';

export default class OrganisationDetail extends React.PureComponent {

    getEmail = () => {
        let email = this.state.organisation.courriel;
        try {
            email = this.state.organisation.meta.kairosData.emailRGC;
        } catch (e) {

        }
        email = this.state.editedCourriel !== undefined ? this.state.editedCourriel : email;

        return email;
    }

    state = {
        email: null,
        editedCourriel: null,
        anoteaEmailmode: 'view',
        resendDisabled: false,
        lastResend: null,
        successShown: false
    }

    static propTypes = {
        organisation: PropTypes.object,
        refresh: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        if (props.organisation !== undefined) {
            this.state.organisation = props.organisation;
            if (props.organisation !== null) {
                this.state.editedCourriel = props.organisation.editedCourriel;
                this.state.email = this.getEmail();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps;
        if (nextProps.organisation !== undefined) {
            this.setState({ organisation: nextProps.organisation });
            if (nextProps.organisation !== null) {
                this.setState({
                    editedCourriel: nextProps.organisation.editedCourriel,
                    organisation: nextProps.organisation
                },
                () => this.setState({
                    email: this.getEmail()
                }));
            }
        }
    }

    deleteEditedCourriel = () => {
        this.setState({ editedCourriel: undefined }, () => this.setState({ email: this.getEmail() }));
    }

    updateEditedCourriel = email => {
        this.setState({ editedCourriel: email, successShown: true }, () => this.setState({ email: this.getEmail() }));
        setTimeout(() => {
            this.setState({ successShown: false });
        }, 3000);
    }

    changeMode = mode => {
        this.setState({ anoteaEmailmode: mode });
    }

    resend = () => {
        resendEmailAccount(this.state.organisation._id).then(() => {
            this.props.refresh();
            this.setState({ resendDisabled: true, lastResend: new Date() });
            setTimeout(() => {
                this.setState({ resendDisabled: false });
            }, 60000);
        });
    }

    render() {
        return (
            <div className="organisationDetail">
                {this.state.organisation === null &&
                    <div className="not-found">
                        <span className="alert-not-found alert alert-danger">Organisme introuvable</span>
                    </div>
                }
                {this.state.organisation &&
                    <div>
                        <h3>{this.state.organisation.raisonSociale}</h3>
                        <h4>SIRET {this.state.organisation._id}</h4>

                        <OrganisationInfo organisation={this.state.organisation} />

                        <button id="btnResend" className="btn btn-info" disabled={this.state.resendDisabled} onClick={this.resend}>
                            <span className="fas fa-location"></span> Renvoyer le lien de connexion
                        </button>

                        <h5>Modifier l'adresse d'un Organisme de Formation</h5>
                        
                        <div className={`updateSuccess ${this.state.successShown ? 'visible' : 'hidden'} alert alert-success`}>
                            Adresse email mise à jour avec succès.
                        </div>

                        <div>
                            { (this.state.editedCourriel || this.state.anoteaEmailmode) &&
                                <Email label="Anotea" current={this.state.editedCourriel} active={this.state.email} organisationId={this.state.organisation._id} deleteEditedCourriel={this.deleteEditedCourriel} updateEditedCourriel={this.updateEditedCourriel} mode={this.state.anoteaEmailmode} changeMode={this.changeMode} editButton={true} />
                            }
                            { (this.state.organisation.meta.kairosData && this.state.editedCourriel) &&
                                <strong>Adresses inactives:</strong>
                            }
                            { this.state.organisation.meta.kairosData &&
                                <Email label="Kairos" current={this.state.organisation.meta.kairosData.emailRGC} active={this.state.email} organisationId={this.state.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                            }
                            { (this.state.organisation.meta.kairosData && !this.state.editedCourriel || !this.state.organisation.meta.kairosData && this.state.editedCourriel) &&
                                <strong>Adresses inactives:</strong>
                            }
                            <Email label="Intercarif" current={this.state.organisation.courriel} active={this.state.email} organisationId={this.state.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
