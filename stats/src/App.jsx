import React, { Component } from 'react';
import './App.css';

import Header from './components/Header'
import FiltersList from './components/FiltersList'
import avisFilters from './constantes/AvisFilters'
import organismesFilters from './constantes/OrganismesFilters'
import StatsTable from './components/StatsTable'
import { getAvis } from './components/services/avisService'
import { getOrganismes } from './components/services/organismeService'
import Loader from './components/Loader'

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isAvis: false,
            isOrganismes: true,
            avis: [],
            organismes: []
        };
    }

    componentDidMount = () => {
        this.getOrganismesStats();
    };

    getOrganismesStats = async () => {
        const organismes = await getOrganismes();
        this.setState({
            organismes: organismes
        });
    };

    getAvisStats = async () => {
        const avis = await getAvis();
        this.setState({
            avis: avis
        });
    };

    getStats = () => {
        this.state.isOrganismes ?
            this.getOrganismesStats() :
            this.getAvisStats()
    };

    changeView = () => {
        this.setState({
            isAvis: !this.state.isAvis,
            isOrganismes: !this.state.isOrganismes
        }, () => {
            this.getStats()
        });
    };

    render() {
        let { avis, organismes, isAvis, isOrganismes } = this.state;

        const organismes_table_columns_title = [
            { id: 1, value: '' },
            { id: 2, value: 'Total' },
            { id: 3, value: 'Total' },
            { id: 4, value: 'Ouverts' },
            { id: 5, value: 'Cliqués' },
            { id: 6, value: 'Actifs' },
            { id: 8, value: 'Non lus' },
            { id: 9, value: 'Répondus' },
            { id: 10, value: 'Avec rép.' },
            { id: 12, value: 'Signalés' },
        ];
        const organismes_colspan = [
            { id: 1, value: 1, title: 'Régions' },
            { id: 2, value: 1, title: 'OF contactés' },
            { id: 3, value: 3, title: 'Mails envoyés' },
            { id: 4, value: 1, title: 'Comptes' },
            { id: 5, value: 5, title: 'Avis' },
        ];
        const avis_table_columns_title = [
            { id: 1, value: '' },
            { id: 2, value: 'Importés' },
            { id: 3, value: 'Contactés' },
            { id: 4, value: 'Envoyés' },
            { id: 5, value: 'Ouverts' },
            { id: 6, value: 'Cliqués' },
            { id: 7, value: 'Validés' },
            { id: 8, value: 'Total' },
            { id: 9, value: 'Com.' },
            { id: 10, value: 'À modérer' },
            { id: 11, value: 'Positif/neutre' },
            { id: 12, value: 'Neg.' },
            { id: 13, value: 'Rejetés' },
        ];
        const avis_colspan = [
            { id: 1, value: 1, title: 'Régions & campagne' },
            { id: 2, value: 2, title: 'Stagiaires' },
            { id: 3, value: 4, title: 'Mails' },
            { id: 4, value: 2, title: 'Avis déposés' },
            { id: 5, value: 4, title: 'Commentaires' },
        ];
        const variant = isAvis ? avisFilters : organismesFilters;
        const statsTable = (avis.length === 0 && isAvis) || (organismes.length === 0 && isOrganismes) ?
            <Loader />
            : isAvis
                ? <StatsTable
                    columnsTitle={avis_table_columns_title}
                    variant={avis_colspan}
                    avis={avis} />
                : <StatsTable
                    columnsTitle={organismes_table_columns_title}
                    isOrganismes={isOrganismes}
                    variant={organismes_colspan}
                    organismes={organismes} />

        return (
            <div className="anotea">
                <Header
                    view={this.changeView}
                    isAvis={isAvis}
                    isOrganismes={isOrganismes}
                />
                <FiltersList variant={variant} />
                {statsTable}
            </div>
        );
    }
}

export default App;
