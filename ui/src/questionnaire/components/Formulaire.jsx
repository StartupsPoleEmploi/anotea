import React, { Component } from 'react';
import Notes from './formulaire/notes/Notes';
import Commentaire from './formulaire/commentaire/Commentaire';
import ErrorMessage from './formulaire/ErrorMessage';
import Formation from './Formation';
import PropTypes from 'prop-types';
import { submitAvis } from '../services/stagiaireService';
import Modal from '../../common/components/Modal';
import Button from '../../common/components/Button';
import Summary from './formulaire/Summary';
import './formulaire.scss';

export default class Formulaire extends Component {

    static propTypes = {
        stagiaire: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    state = {
        showModal: false,
        averageScore: 0,
        isNotesValid: false,
        notes: [
            { index: 0, value: null },
            { index: 1, value: null },
            { index: 2, value: null },
            { index: 3, value: null },
            { index: 4, value: null },
        ],
        commentaire: {
            titre: {
                value: '',
                isValid: true,
            },
            texte: {
                value: '',
                isValid: true,
            },
        },
        stagiaire: null,
        showErrorMessage: null,
        goNextButtonClicked: false,
        submitting: false,
        page: 0
    };

    scrollToTop = () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    };

    isFormValid = () => {
        let commentaire = this.state.commentaire;
        let isCommentaireValid = commentaire.texte.isValid && commentaire.titre.isValid;

        return this.state.isNotesValid && isCommentaireValid;
    };

    openModal = () => {
        if (this.isFormValid()) {
            this.setState({ showModal: true });
        } else {
            this.setState({ goNextButtonClicked: true }, () => this.scrollToTop());
        }
    };

    closeModal = () => {
        this.setState({ showModal: false });
    };

    goBack = () => {
        this.setState({ page: 0 }, () => this.scrollToTop());
    };

    goNext = () => {
        if (this.isFormValid()) {
            this.setState({ page: 1 }, () => this.scrollToTop());
        } else {
            this.setState({ goNextButtonClicked: true }, () => this.scrollToTop());
        }
    };

    submit = () => {

        if (this.state.submitting) {
            return;
        }

        this.setState({ submitting: true }, async () => {
            try {
                let data = await submitAvis(this.props.stagiaire.token, {
                    avis_accueil: this.state.notes[0].value,
                    avis_contenu_formation: this.state.notes[1].value,
                    avis_equipe_formateurs: this.state.notes[2].value,
                    avis_moyen_materiel: this.state.notes[3].value,
                    avis_accompagnement: this.state.notes[4].value,
                    commentaire: {
                        texte: this.state.commentaire.texte.value,
                        titre: this.state.commentaire.titre.value,
                    },
                });
                this.props.onSubmit(data);
                this.scrollToTop();
            } catch (ex) {
                console.error('An error occured', ex);
                this.setState({ showErrorMessage: true });
            }

            this.setState({ submitting: false });
            this.closeModal();
        });
    };

    computeAverageScore = () => {
        let total = this.state.notes.reduce((acc, note) => {
            acc += note.value;
            return acc;
        }, 0);
        return parseFloat(total) / 5;
    };

    updateNotes = (notes, isValid) => {
        this.setState({ notes, isNotesValid: isValid }, () => {
            if (isValid) {
                this.setState({ averageScore: this.computeAverageScore() });
            }
        });
    };

    updateCommentaire = (fieldName, value, isValid) => {
        this.setState({
            commentaire: Object.assign({}, this.state.commentaire, {
                [fieldName]: { value, isValid }
            })
        });
    };

    render() {
        return (
            <div className="formulaire">
                {!this.state.error && this.props.stagiaire &&
                <div className={`container ${this.state.page === 0 ? 'pageOne' : 'pageTwo'}`}>

                    {this.state.page === 0 &&
                    <div>
                        <Formation stagiaire={this.props.stagiaire} />
                        <Notes
                            notes={this.state.notes}
                            averageScore={this.state.averageScore}
                            onChange={this.updateNotes}
                            showErrorMessage={this.state.goNextButtonClicked} />
                        <div className="plusQuneDerniere">Plus qu&apos;une dernière étape.</div>
                    </div>
                    }

                    {this.state.page === 1 &&
                    <Commentaire commentaire={this.state.commentaire} onChange={this.updateCommentaire} />
                    }

                    <div className="row">
                        <div className="col-sm-12 offset-md-1 col-md-10 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                            <div className="d-flex justify-content-center">
                                {this.state.page === 0 &&
                                <div>
                                    <Button
                                        className="send-button"
                                        size="large"
                                        color="blue"
                                        onClick={this.goNext}>
                                        Suivant
                                    </Button>
                                </div>
                                }
                                {this.state.page === 1 &&
                                <div>
                                    <Button
                                        className="go-back"
                                        size="large"
                                        color="blue"
                                        onClick={this.goBack}>
                                        Retour
                                    </Button>
                                    <Button
                                        className="send-button"
                                        size="large"
                                        color="blue"
                                        onClick={this.openModal}>
                                        Envoyer
                                    </Button>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    {this.state.showErrorMessage && <ErrorMessage />}
                </div>
                }

                {this.state.showModal &&
                <Modal
                    title="Confirmer l&apos;envoi de l&apos;avis ?"
                    body={
                        <Summary
                            averageScore={this.state.averageScore}
                            commentaire={this.state.commentaire} />
                    }
                    onClose={this.closeModal}
                    onConfirmed={this.submit} />
                }
            </div>
        );
    }
}

