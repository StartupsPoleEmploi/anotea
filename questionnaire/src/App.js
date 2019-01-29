import React, { Component } from 'react';

import Header from './components/Header';
import Notes from './components/Notes';
import Commentaire from './components/Commentaire';
import Footer from './components/Footer';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        
        <Notes />

        <Commentaire />

        <Footer codeRegion="11" />
      </div>
    );
  }
}

export default App;
