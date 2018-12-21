import React from 'react';
import { getOrganisationInfo } from '../../../../lib/organisationService';
import OrganisationCard from './OrganisationCard';

export default class OrganisationPanel extends React.PureComponent {

    state = {
        siret: '',
        message: false,
    };

    showMessage = (type, text) => {
        this.setState({ message: { type, text } }, () => {
            setTimeout(() => this.removeMessage(), 5000);
        });
    };

    removeMessage = () => {
        this.setState({ message: null });
    };

    searchOrganisation = async () => {
        try {
            let organisation = await getOrganisationInfo(this.state.siret);
            this.setState({ organisation: organisation });
        } catch (e) {
            this.setState({ organisation: null, message: { type: 'danger', text: 'Organisme introuvable' } });
        }
    };

    render() {
        return (
            <div style={{ marginBottom: '50px' }}>
                <h1>Gestion des organismes</h1>

                <div className="row">
                    <div className="col-md-7">
                        <div className="input-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                className="searchField form-control"
                                style={{ margin: 0, width: '400px', flex: 'inherit' }}
                                placeholder="SIRET"
                                value={this.state.siret}
                                onChange={e => this.setState({ siret: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && this.searchOrganisation()} />

                            <div className="input-group-append">
                                <button className="btn btn-outline-primary" onClick={this.searchOrganisation}>
                                    <span className="fas fa-search" /> Chercher
                                </button>
                            </div>

                        </div>
                    </div>
                    {
                        this.state.message &&
                        <div className="col-md-5">
                            <div className={'alert alert-' + this.state.message.type} role="alert">
                                {this.state.message.text}
                            </div>
                        </div>
                    }
                </div>

                {
                    this.state.organisation &&
                    <OrganisationCard
                        organisation={this.state.organisation}
                        reloadOrganisation={this.searchOrganisation}
                        showMessage={this.showMessage}
                    />
                }
            </div>
        );
    }
}
