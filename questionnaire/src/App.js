import React, { Component } from 'react';

import Header from './components/Header';
import Notes from './components/Notes';
import Commentaire from './components/Commentaire';
import Footer from './components/Footer';
import Autorisations from './components/Autorisations';
import SendButton from './components/SendButton';

import './App.scss';

class App extends Component {

    state = {
        isValid: false
    }

    setValid = valid => {
        this.setState({ isValid: valid });
    }

    onSend = () => {
        // TODO
    }

    render() {
        return (
            <div className="App">
                <Header />

                <Notes setValid={this.setValid}/>

                <Commentaire />

                <Autorisations />

                <SendButton enabled={this.state.isValid} onSend={this.onSend} />

                <Footer codeRegion="11" />
            </div>
        );
    }
}

export default App;
