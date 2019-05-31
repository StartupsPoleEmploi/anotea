import React, { Component } from 'react';
import './App.css';

import Header from './components/Header'
import FiltersList from './components/FiltersList'

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
        return (
            <div className="anotea">
                <Header 
                    view={this.changeView} 
                    isAvis={this.state.isAvis} 
                    isOrganismes={this.state.isOrganismes}
                />
                <FiltersList />
            </div>
        );
    }
}

export default App;
