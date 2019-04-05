import React, { Component } from 'react';
import moment from 'moment';

import Stars from './Stars';

import styles from './avisAvecCommentaire.css.js';

class AvisAvecCommentaire extends Component {

    state = {
        avis: [],
        page: 0
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

                        <span className="line" />
                        <h2>{this.state.avis.length} commentaires</h2>
                        <span className="line" />

                        <div>
                            { this.state.page > 0 &&
                                <span className="fas fa-chevron-left nav" onClick={this.goto.bind(this, -1)}></span>
                            }

                            <div className="avis">
                                <Stars value={this.state.avis[this.state.page].notes.global} /> <span className="pseudo">par {this.state.avis[this.state.page].pseudo ? this.state.avis[this.state.page].pseudo : 'un stagiaire'}</span>
                                <div className="date">Le {moment(this.state.avis[this.state.page].date).format('DD/MM/YYYY')}</div>
                                <h3 className="titre">{this.state.avis[this.state.page].commentaire.titre}</h3>
                                <span className="texte">{this.state.avis[this.state.page].commentaire.texte}</span>
                            </div>

                            { this.state.page < this.state.avis.length - 1 &&
                                <span className="fas fa-chevron-right nav" onClick={this.goto.bind(this, 1)}></span>
                            }
                        </div>

                        <div className="pageIndicator">{this.state.page + 1} sur {this.state.avis.length}</div>
                    </div>
                }
            </div>
        );
    }
}

export default AvisAvecCommentaire;
