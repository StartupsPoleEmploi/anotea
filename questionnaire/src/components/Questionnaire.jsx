import React, { Component } from 'react';

import './questionnaire.scss';

import Header from './Header';
import Notes from './Notes';
import Commentaire from './Commentaire';
import Footer from './Footer';
import Autorisations from './Autorisations';
import SendButton from './common/SendButton';
import SummaryModal from './SummaryModal';

import PropTypes from 'prop-types';

import { getTraineeInfo } from '../lib/traineeService';

class Questionnaire extends Component {

    state = {
        isValid: false,
        modalOpen: false,
        averageScore: null,
        notes: [],
        commentaire: {
            titre: '',
            commentaire: ''
        },
        pseudo: '',
        trainee: null
    }

    static propTypes = {
        match: PropTypes.object.isRequired
    }
    
    constructor(props) {
        super(props);
        this.state.token = props.match.params.token;
        getTraineeInfo(this.state.token).then(result => {
            if (result.error) {
                // TODO : : already sent
            } else {
                this.setState({ trainee: result.trainee });
            }
        });
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
            <div className="questionnaire">
                <Header trainee={this.state.trainee} />

                <Notes setValid={this.setValid} />

                {this.state.isValid &&
                    <Commentaire onChange={this.updateCommentaire} />
                }

                <Autorisations />

                <SendButton enabled={this.state.isValid} onSend={this.openModal} />

                {this.state.modalOpen &&
                    <SummaryModal closeModal={this.closeModal} score={this.state.averageScore} notes={this.state.notes} commentaire={this.state.commentaire} pseudo={this.state.pseudo} submit={this.submit} />
                }

                <Footer codeRegion="11" />
            </div>
        );
    }
}

export default Questionnaire;
