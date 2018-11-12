import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

import Email from './Email';


export default class OrganisationDetail extends React.PureComponent {
    //13000285000019

    getEmail = () => {
        let email = this.props.organisation.courriel;
        try {
            email = this.props.organisation.meta.kairosData.emailRGC;
        } catch (e) {

        }
        email = this.state.editedEmail !== undefined ? this.state.editedEmail : email;

        return email;
    }

    state = {
        email: null,
        editedEmail: null,
        anoteaEmailmode: 'view'
    }

    static propTypes = {
        organisation: PropTypes.object
    }

    constructor(props) {
        super(props);
        if (props.organisation) {
            this.state.editedEmail = props.organisation.editedEmail;
            this.state.email = this.getEmail();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps;
        if (nextProps.organisation) {
            this.setState({ editedEmail: nextProps.organisation.editedEmail }, () => this.setState({ email: this.getEmail() }));
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
                            { (this.state.editedEmail || this.state.anoteaEmailmode) &&
                                <Email label="Anotea" current={this.state.editedEmail} active={this.state.email} organisationId={this.props.organisation._id} deleteEditedEmail={this.deleteEditedEmail} updateEditedEmail={this.updateEditedEmail} mode={this.state.anoteaEmailmode} changeMode={this.changeMode} editButton={true} />
                            }
                            { this.props.organisation.meta.kairosData &&
                                <Email label="Kairos" current={this.props.organisation.meta.kairosData.emailRGC} active={this.state.email} organisationId={this.props.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                            }
                            <Email label="Intercarif" current={this.props.organisation.courriel} active={this.state.email} organisationId={this.props.organisation._id} changeMode={this.changeMode} editButton={this.state.anoteaEmailmode === 'view'} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
