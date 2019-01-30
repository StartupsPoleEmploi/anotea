import React, { Component } from 'react';

import Header from './components/Header';
import Notes from './components/Notes';
import Commentaire from './components/Commentaire';
import Footer from './components/Footer';
import Autorisations from './components/Autorisations';
import SendButton from './components/SendButton';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />

        <Notes />

        <Commentaire />

        <Autorisations />

        <SendButton />

        <Footer codeRegion="11" />
      </div>
    );
  }
}

export default App;
