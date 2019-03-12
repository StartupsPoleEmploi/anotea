import React, { Component } from 'react';

import './questionnaire.scss';

import Notes from './Notes';
import Commentaire from './Commentaire';
import Footer from './Footer';
import Autorisations from './Autorisations';
import SendButton from './common/SendButton';
import SummaryModal from './SummaryModal';
import ErrorPanel from './ErrorPanel';
import ErrorAlert from './ErrorAlert';
import Header from './Header';

import PropTypes from 'prop-types';

import { getStagiaireInfo, submitAvis } from '../lib/stagiaireService';

class Questionnaire extends Component {

    state = {
        isValid: false,
        modalOpen: false,
        averageScore: null,
        notes: [],
        commentaire: {
            titre: '',
            texte: ''
        },
        badwords: false,
        pseudo: '',
        stagiaire: null,
        accord: false,
        accordEntreprise: false,
        error: null,
        formError: null,
        clicked: false
    }

    static propTypes = {
        token: PropTypes.string.isRequired,
        showRemerciements: PropTypes.func.isRequired,
        setStagiaire: PropTypes.func.isRequired
    }
    
    constructor(props) {
        super(props);
        this.state.token = props.token;
        this.loadInfo(this.state.token);
    }

    loadInfo = async token => {
        try {
            let info = await getStagiaireInfo(token);
            this.setState({ stagiaire: info.trainee });
            this.props.setStagiaire(info.trainee);
        } catch (ex) {
            let error = await ex.json;
            if (error.statusCode === 423) {
                this.setState({ error: 'already sent' });
            } else {
                this.setState({ error: 'error' });
            }
        }
    }

    setValid = (valid, averageScore, notes) => {
        this.setState({ isValid: valid, averageScore, notes });
    }

    openModal = () => {
        if (this.state.isValid) {
            this.setState({ modalOpen: true });
        } else {
            this.setState({ clicked: true });
        }
    }

    closeModal = () => {
        this.setState({ modalOpen: false });
    }

    submit = async () => {
        let avis = {
            avis_accueil: this.state.notes[0].value,
            avis_contenu_formation: this.state.notes[1].value,
            avis_equipe_formateurs: this.state.notes[2].value,
            avis_moyen_materiel: this.state.notes[3].value,
            avis_accompagnement: this.state.notes[4].value,
            pseudo: this.state.pseudo,
            commentaire: this.state.commentaire,
            accord: this.state.accord,
            accordEntreprise: this.state.accordEntreprise
        };

        try {
            let response = await submitAvis(this.state.token, avis);
            this.props.showRemerciements(response.infos);
        } catch (ex) {
            let error = await ex.json;
            if (error.statusCode === 400) {
                this.setState({ formError: 'bad data' });
            } else {
                this.setState({ error: 'error' });
            }
        }

        this.closeModal();
    }

    updateCommentaire = (commentaire, badwords) => {
        this.setState({ commentaire: commentaire.commentaire, pseudo: commentaire.pseudo, badwords: badwords.titre || badwords.texte || badwords.pseudo });
    }

    updateAccord = ({accord, accordEntreprise }) => {
        this.setState({ accord, accordEntreprise });
    }

    render() {
        return (
            <div className="questionnaire">
                { !this.state.error && this.state.stagiaire &&
                    <div>
                        <Header stagiaire={this.state.stagiaire} />

                        <Notes setValid={this.setValid} clicked={this.state.clicked} />

                        {this.state.isValid &&
                            <Commentaire onChange={this.updateCommentaire} />
                        }

                        <Autorisations onChange={this.updateAccord}/>

                        <SendButton enabled={!this.state.badwords} onSend={this.openModal} />

                        { this.state.formError === 'bad data' &&
                            <ErrorAlert />
                        }

                        <Footer codeRegion={this.state.stagiaire.codeRegion} />
                    </div>
                }

                {this.state.modalOpen &&
                    <SummaryModal closeModal={this.closeModal} score={this.state.averageScore} notes={this.state.notes} commentaire={this.state.commentaire} pseudo={this.state.pseudo} submit={this.submit} />
                }

                { this.state.error &&
                    <ErrorPanel error={this.state.error} />
                }
            </div>
        );
    }
}

export default Questionnaire;
