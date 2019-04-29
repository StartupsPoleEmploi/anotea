import React, { Component } from 'react';
import moment from 'moment';

import Stars from './Stars';
import Verified from './Verified';

import styles from './AvisAvecCommentaireLarge.css.js';

const PAGE_SIZE = 3;

class AvisAvecCommentaireLarge extends Component {

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

    goto = page => {
        this.setState({page: page })
    }

    pageCount = () => {
        return Math.ceil(this.state.avis.length / PAGE_SIZE);
    }

    getPagesBefore = () => {
        let array = [];
        if (this.state.page - 2 > 0) {
            array.push(1);
            if (this.state.page - 2 > 1) {
                array.push('...');
            }
        }

        for (let i=Math.max(this.state.page - 2, 0);i<this.state.page;i++) {
            array.push(i + 1);
        }
        return array;
    }

    getPagesAfter = () => {
        let array = [];
        for (let i=Math.min(this.state.page + 2, this.pageCount() - 1);i>this.state.page;i--) {
            array.push(i + 1);
        }
        array.reverse();
        if (this.state.page + 2 < this.pageCount() - 1) {
            if (this.state.page + 2 < this.pageCount() - 2) {
                array.push('...');
            }
            array.push(this.pageCount());
        }
        return array;
    }

    render() {
        return (
            <div className="avis-avec-commentaire large" style={{width: `${this.props.width}px`}}>
                <style>{styles}</style>

                    <div>
                        <div className="commentaires-header">
                            <h2>{this.state.avis.length} commentaires</h2>
                        </div>
                        
                        <Verified />

                        { this.state.avis[this.state.page] &&
                            <div>
                                {this.state.avis.slice(this.state.page * PAGE_SIZE, this.state.page * PAGE_SIZE + PAGE_SIZE).map(avis =>
                                    <div className="avis">
                                        <div className="head-avis"><Stars value={avis.notes.global} /> <span className="pseudo">par {avis.pseudo ? avis.pseudo : 'un stagiaire'}</span></div>

                                        {avis.commentaire.titre &&
                                            <h3 className="titre">{avis.commentaire.titre}</h3>
                                        }

                                        {avis.commentaire.texte &&
                                            <div className="texte">{avis.commentaire.texte}</div>
                                        }

                                        <div className="date">Session du {moment(avis.startDate).format('DD/MM/YYYY')}
                                            {avis.startDate !== avis.scheduledEndDate &&
                                                <span>au {moment(avis.scheduledEndDate).format('DD/MM/YYYY')}</span>
                                            }
                                        </div>
                                    </div>
                                )}

                                {this.pageCount() > 1 &&
                                    <div className="pagination">
                                        {
                                            this.getPagesBefore().map(page =>
                                                <span className="pageIndicator" onClick={!isNaN(page) && this.goto.bind(this, page - 1)}>{page}</span>
                                            )
                                        }
                                        <span className="pageIndicator current">{this.state.page + 1}</span>
                                        {
                                            this.getPagesAfter().map(page =>
                                                <span className="pageIndicator" onClick={!isNaN(page) && this.goto.bind(this, page - 1)}>{page}</span>
                                            )
                                        }
                                    </div>
                                }
                            </div>
                        }
                </div>
                
                { this.state.avis.length === 0 &&
                    <div className="pas-commentaire">
                    Il n'y a pas de commentaire sur cette formation pour le moment.
                    </div>
                }
            </div>
        );
    }
}

export default AvisAvecCommentaireLarge;
