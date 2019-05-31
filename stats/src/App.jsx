import React, { Component } from 'react';
import './App.css';

import Header from './components/Header'
import FiltersList from './components/FiltersList'
import avisFilters from './constantes/AvisFilters'
import organismesFilters from './constantes/OrganismesFilters'

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
        const variant = this.state.isAvis ? avisFilters : organismesFilters;

        return (
            <div className="anotea">
                <Header 
                    view={this.changeView} 
                    isAvis={this.state.isAvis} 
                    isOrganismes={this.state.isOrganismes}
                />
                <FiltersList variant={variant} />
            </div>
        );
    }
}

export default App;
