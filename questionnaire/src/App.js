import React, { Component } from 'react';

import Header from './components/Header';
import Notes from './components/Notes';
import Commentaire from './components/Commentaire';
import Footer from './components/Footer';
import Autorisations from './components/Autorisations';
import SendButton from './components/common/SendButton';
import SummaryModal from './components/SummaryModal';

import './App.scss';

class App extends Component {

    state = {
        isValid: false,
        modalOpen: false,
        averageScore: null,
        notes: [],
        commentaire: {
            titre: '',
            commentaire: ''
        },
        pseudo: ''
    }

    setValid = (valid, averageScore, notes) => {
        this.setState({ isValid: valid, averageScore, notes });
    }

    openModal = () => {
        this.setState({ modalOpen: true });
    }

    closeModal = () => {
        this.setState({ modalOpen: false });
    }

    submit = () => {

    }

    updateCommentaire = commentaire => {
        this.setState({ commentaire: commentaire.commentaire, pseudo: commentaire.pseudo });
    }

    render() {
        return (
            <div className="App">
                <Header />

                <Notes setValid={this.setValid}/>

                <Commentaire onChange={this.updateCommentaire} />

                <Autorisations />

                <SendButton enabled={this.state.isValid} onSend={this.openModal} />

                { this.state.modalOpen &&
                    <SummaryModal closeModal={this.closeModal} score={this.state.averageScore} notes={this.state.notes} commentaire={this.state.commentaire} pseudo={this.state.pseudo} submit={this.submit} />
                }

                <Footer codeRegion="11" />
            </div>
        );
    }
}

export default App;
