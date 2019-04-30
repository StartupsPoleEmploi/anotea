import React, { Component } from 'react';
import moment from 'moment';

import Stars from './Stars';

import styles from './AvisAvecCommentaire.css.js';

class AvisAvecCommentaire extends Component {

    state = {
        avis: [],
        page: 0
    }

    constructor(props) {
        super();
        this.state.avis = props.avis;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.avis) {
            this.setState({ avis: nextProps.avis });
        }
    }

    goto = step => {
        this.setState({page: this.state.page + step })
    }

    render() {
        return (
            <div className="avis-avec-commentaire">
                <style>{styles}</style>
                {this.state.avis[this.state.page] &&
                    <div>
                        <div className="commentaires-header">
                            <span className="line" />
                            <h2>{this.state.avis.length} commentaires</h2>
                        </div>

                        <div>
                            <div className="avis">
                                <div className="container">
                                    <div className="head-avis"><Stars value={this.state.avis[this.state.page].notes.global} /> <span className="pseudo">par {this.state.avis[this.state.page].pseudo ? this.state.avis[this.state.page].pseudo : 'un stagiaire'}</span></div>
                                    
                                    { this.state.avis[this.state.page].commentaire.titre &&
                                        <h3 className="titre">{this.state.avis[this.state.page].commentaire.titre}</h3>
                                    }

                                    { this.state.avis[this.state.page].commentaire.texte &&
                                        <div className="texte">{this.state.avis[this.state.page].commentaire.texte}</div>
                                    }

                                    { this.state.avis.commentaire.reponse && 
                                        <div className="answer">
                                            <div className="titre">Réponse de l'organisme</div>
                                            <div className="texte">{ this.state.avis.commentaire.reponse }</div>
                                        </div>
                                    }

                                </div>

                                <div className="date">Session du {moment(this.state.avis[this.state.page].startDate).format('DD/MM/YYYY')}
                                 {this.state.avis[this.state.page].startDate !==  this.state.avis[this.state.page].scheduledEndDate &&
                                    <span>au {moment(this.state.avis[this.state.page].scheduledEndDate).format('DD/MM/YYYY')}</span>
                                 }
                                 </div>
                            </div>

                            { this.state.avis.length > 1 &&
                                <div className="pagination">
                                    <div className="nav-left">
                                        { this.state.page > 0 &&
                                            <span className="fas fa-chevron-left nav" onClick={this.goto.bind(this, -1)}></span>
                                        }
                                    </div>

                                    <div className="nav-right">
                                        { this.state.page < this.state.avis.length - 1 &&
                                            <span className="fas fa-chevron-right nav" onClick={this.goto.bind(this, 1)}></span>
                                        }
                                    </div>

                                    <span className="pageIndicator">{this.state.page + 1} sur {this.state.avis.length}</span>
                                </div>
                            }
                        </div>
                    </div>
                }

                { this.state.avis.length === 0 &&
                    <div className="pas-commentaire">Il n'y a pas de commentaire sur cette formation pour le moment.</div>
                }
            </div>
        );
    }
}

export default AvisAvecCommentaire;
