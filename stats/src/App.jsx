import React from 'react';
import './App.css';

import Header from './components/Header'
import FiltersList from './components/FiltersList'

function App() {
    return (
        <div className="anotea">
            <Header />
            <FiltersList />
        </div>
    );
}

export default App;
