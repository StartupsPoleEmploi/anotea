
import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import AverageScore from './common/AverageScore';
import SendButton from './common/SendButton';

import './summaryModal.scss';

import items from '../data.json';

class SummaryModal extends Component {

    static propTypes = {
        score: PropTypes.number.isRequired,
        closeModal: PropTypes.func.isRequired,
        submit: PropTypes.func.isRequired,
        notes: PropTypes.array.isRequired,
        commentaire: PropTypes.object.isRequired,
        pseudo: PropTypes.string.isRequired
    }

    customStyles = {
        content: {
            width: '60%',
            margin: 'auto',
            marginTop: '25%',
            height: '310px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #F4F4F5'
        }
    };

    render() {
        return (
            <Modal
                isOpen={true}
                ariaHideApp={false}
                className="summary-modal"
                style={this.customStyles}
            >

                <h2>Confirmer l&apos;envoi de l&apos;avis ?</h2>

                <div className="summary container">
                    <div className="header-summary row">
                        <div className="col-sm-2">
                            <AverageScore score={this.props.score} />
                            <span>par <strong>{this.props.pseudo !== '' ? this.props.pseudo : 'anonyme'}</strong></span>
                        </div>
                        

                        <div className="col-sm-8">
                            { (this.props.commentaire.titre !== '' || this.props.commentaire.texte !== '') && 
                                <div>
                                    <h3>{this.props.commentaire.titre}</h3>
                                    <p>
                                        {this.props.commentaire.texte}
                                    </p>
                                </div>
                            }
                            { this.props.commentaire.titre === '' && this.props.commentaire.texte === '' && 
                                <span>Si vous souhaitez écrire un commentaire, cliquer sur annuler.</span>
                            }
                        </div>
                    </div>

                    <ul className="note-list row">
                        {
                            items.map((item, index) => {
                                return (
                                    <li className={`col-sm-2 ${index % 2 === 0 ? 'even' : 'odd'}`} key={index}>
                                        <h3>{item.title}</h3>
                                        <span>{this.props.notes[index].value}/5 <i className="fas fa-star" /></span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>

                <div className="buttons">
                    <a className="cancel" onClick={this.props.closeModal}>Annuler</a> <SendButton enabled={true} onSend={this.props.submit} text="Confirmer" />
                </div>
            </Modal>
        );
    }
}

export default SummaryModal;
