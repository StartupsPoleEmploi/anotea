import React from 'react';
import { getOrganisationInfo } from '../../organisation/service/organismeService';
import OrganismeCard from './OrganismeCard';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';

export default class OrganismePanelDeprecated extends React.PureComponent {

    state = {
        siret: '',
        message: null,
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

    searchOrganisation = async (options = {}) => {

        this.setState({ organisme: null, ...(options.silent ? {} : { message: null, loading: true }) }, async () => {
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
                <div>
                    <h1 className="title">Gestion des organismes</h1>
                    <p className="subtitle">
                        Ici, vous trouverez les réponses des organismes de formation adressées aux stagiaires.
                        Vous pouvez également consulter les informations d&apos;un organisme en effectuant une recherche
                    </p>
                </div>
            }
            toolbar={
                <nav className="nav">
                    <li className="nav-item nav-search">
                        <div className="d-flex align-items-center">
                            <div className="input-group active">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="fas fa-search" /></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="SIRET"
                                    value={this.state.siret}
                                    onChange={e => this.setState({ siret: e.target.value })}
                                    onKeyPress={e => e.key === 'Enter' && this.searchOrganisation()} />

                            </div>
                            <button className="btn active" onClick={this.searchOrganisation}>
                                Rechercher
                            </button>
                        </div>
                    </li>
                </nav>
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
                                        reloadOrganisation={() => this.searchOrganisation({ silent: true })}
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
