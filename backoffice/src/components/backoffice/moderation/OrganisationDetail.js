import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

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
        email = this.state.editedEmail !== undefined ? this.state.editedEmail : email;

        return email;
    }

    state = {
        email: null,
        editedEmail: null,
        anoteaEmailmode: 'view',
    }

    static propTypes = {
        organisation: PropTypes.object,
        refresh: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        if (props.organisation) {
            this.state.organisation = props.organisation;
            this.state.editedEmail = props.organisation.editedEmail;
            this.state.email = this.getEmail();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps;
        if (nextProps.organisation) {
            this.setState({
                editedEmail: nextProps.organisation.editedEmail,
                organisation: nextProps.organisation
            },
            () => this.setState({
                email: this.getEmail()
            }));
        }
    }

    deleteEditedEmail = () => {
        this.setState({ editedEmail: undefined }, () => this.setState({ email: this.getEmail() }));
    }

    updateEditedEmail = email => {
        this.setState({ editedEmail: email }, () => this.setState({ email: this.getEmail() }));
    }

    changeMode = mode => {
        this.setState({ anoteaEmailmode: mode });
    }

    resend = () => {
        resendEmailAccount(this.state.organisation._id).then(() => {
            this.props.refresh();
        });
    }

    render() {
        return (
            <div className="organisationDetail">
                {this.state.organisation === null &&
                    <div >
                        <span className="alert alert-danger">Organisme introuvable</span>
                    </div>
                }
                {this.state.organisation &&
                    <div>
                        <h3>{this.state.organisation.raisonSociale}</h3>
                        <h4>SIRET {this.state.organisation._id}</h4>

                        <OrganisationInfo organisation={this.state.organisation} />

                        Actions :
                        <ul>
                            <li><button onClick={this.resend}>Renvoyer le lien de connexion</button></li>
                        </ul>

                        <strong>Modifier l'adresse d'un Organisme de Formation</strong>
                        <div>
                            { (this.state.editedEmail || this.state.anoteaEmailmode) &&
                                <Email label="Anotea" current={this.state.editedEmail} active={this.state.email} organisationId={this.state.organisation._id} deleteEditedEmail={this.deleteEditedEmail} updateEditedEmail={this.updateEditedEmail} mode={this.state.anoteaEmailmode} changeMode={this.changeMode} editButton={true} />
                            }
                            { this.state.organisation.meta.kairosData &&
                                <Email label="Kairos" current={this.state.organisation.meta.kairosData.emailRGC} active={this.state.email} organisationId={this.state.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                            }
                            <Email label="Intercarif" current={this.state.organisation.courriel} active={this.state.email} organisationId={this.state.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
