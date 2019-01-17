import React from 'react';
import { getOrganisationInfo } from '../../../../lib/organisationService';
import OrganismeCard from './OrganismeCard';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';

export default class OrganismePanel extends React.PureComponent {

    state = {
        siret: '',
        message: false,
        loading: false,
        organisme: null
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

        this.setState({ loading: true, organisme: null, message: false }, async () => {
            try {
                let organisme = await getOrganisationInfo(this.state.siret);
                this.setState({ organisme: organisme, loading: false });
            } catch (e) {
                this.setState({
                    organisme: null,
                    loading: false,
                    message: { type: 'danger', text: 'Organisme introuvable' }
                });
            }
        });
    };

    render() {

        return <Panel
            header={
                <h1 className="title">Gestion des organismes</h1>
            }
            toolbar={
                <div className="input-group">
                    <input
                        type="text"
                        className="searchField form-control"
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
            }
            results={
                this.state.loading ?
                    <div className="mx-auto" style={{ width: '200px' }}><Loader /></div> :
                    <div className="row">
                        <div className="col-sm-12">
                            {
                                this.state.message &&
                                <div className={'alert alert-' + this.state.message.type} role="alert">
                                    {this.state.message.text}
                                </div>
                            }
                            {
                                this.state.organisme &&
                                <div>
                                    <p className="description">Résultats de la recherche</p>
                                    <OrganismeCard
                                        organisme={this.state.organisme}
                                        reloadOrganisation={this.searchOrganisation}
                                        showMessage={this.showMessage}
                                    />
                                </div>
                            }
                        </div>
                    </div>
            }
        />;
    }
}
