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
        email = this.props.organisation.editedEmail !== undefined ? this.props.organisation.editedEmail : email;

        return email;
    }

    static propTypes = {
        organisation: PropTypes.object
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
                            { this.props.organisation.editedEmail &&
                                <Email label="Anotea" current={this.props.organisation.editedEmail} active={this.getEmail()} organisationId={this.props.organisation._id} />
                            }
                            { this.props.organisation.meta.kairosData &&
                                <Email label="Kairos" current={this.props.organisation.meta.kairosData.emailRGC} active={this.getEmail()} organisationId={this.props.organisation._id} />
                            }
                            <Email label="Intercarif" current={this.props.organisation.courriel} active={this.getEmail()} organisationId={this.props.organisation._id} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
