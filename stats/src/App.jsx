import React, { Component } from 'react';
import './App.css';

import Header from './components/Header'
import FiltersList from './components/FiltersList'
import avisFilters from './constantes/AvisFilters'
import organismesFilters from './constantes/OrganismesFilters'
import StatsTable from './components/StatsTable'

class App extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isAvis: false,
            isOrganismes: true
        };
    }

    changeView = () => {
        this.setState({ 
            isAvis: !this.state.isAvis, 
            isOrganismes: !this.state.isOrganismes 
        });
    }

    render() {
        const organismes_table_columns_title = [
            {id: 1, value: ''},
            {id: 2, value: 'Total'},
            {id: 3, value: 'Total'},
            {id: 4, value: 'Ouverts'},
            {id: 5, value: 'Cliqués'},
            {id: 6, value: 'Actifs'},
            {id: 7, value: 'Connexion'},
            {id: 8, value: 'Non lus'},
            {id: 9, value: 'Répondus'},
            {id: 10, value: 'Av. com'},
            {id: 11, value: 'Notes seules'},
            {id: 12, value: 'Signalés'},
            {id: 13, value: 'Rejetés'},
        ];
        const organismes_colspan = [
            {id: 1, value: 1, title: 'Régions'},
            {id: 2, value: 1, title: 'OF contactés'},
            {id: 3, value: 3, title: 'Mails envoyés'},
            {id: 4, value: 2, title: 'Comptes'},
            {id: 5, value: 5, title: 'Avis'},
        ];
        const avis_table_columns_title = [
            {id: 1, value: ''},
            {id: 2, value: 'Importés'},
            {id: 3, value: 'Contactés'},
            {id: 4, value: 'Envoyés'},
            {id: 5, value: 'Ouverts'},
            {id: 6, value: 'Cliqués'},
            {id: 7, value: 'Validés'},
            {id: 8, value: 'Total'},
            {id: 9, value: 'Com.'},
            {id: 10, value: 'Total'},
            {id: 11, value: 'Positif/neutre'},
            {id: 12, value: 'Neg.'},
            {id: 13, value: 'Rejetés'},
        ];
        const avis_colspan = [
            {id: 1, value: 1, title: 'Régions & campagne'},
            {id: 2, value: 2, title: 'Stagiaires'},
            {id: 3, value: 4, title: 'Mails'},
            {id: 4, value: 2, title: 'Avis déposés'},
            {id: 5, value: 4, title: 'Commentaires'},
        ];
        const variant = this.state.isAvis ? avisFilters : organismesFilters;
        const statsTable = this.state.isAvis ? 
            <StatsTable columnsTitle={avis_table_columns_title} variant={avis_colspan} /> 
            : <StatsTable columnsTitle={organismes_table_columns_title} variant={organismes_colspan} />

        return (
            <div className="anotea">
                <Header 
                    view={this.changeView} 
                    isAvis={this.state.isAvis} 
                    isOrganismes={this.state.isOrganismes}
                />
                <FiltersList variant={variant} />
                {statsTable}
            </div>
        );
    }
}

export default App;
