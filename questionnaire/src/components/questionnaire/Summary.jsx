import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AverageScore from './notes/AverageScore';
import './summary.scss';

class Summary extends Component {

    static propTypes = {
        averageScore: PropTypes.number.isRequired,
        pseudo: PropTypes.string.isRequired,
        commentaire: PropTypes.object.isRequired,
    };

    render() {
        return (
            <div className="summary">
                <div className="row">
                    <div className="col-sm-3 separator">
                        <AverageScore score={this.props.averageScore} />
                        <span className="by">par &nbsp;</span>
                        <span className="pseudo">{this.props.pseudo || 'anonyme'}</span>
                    </div>
                    <div className="col-sm-9">
                        {this.props.commentaire.titre &&
                        <div className="titre">
                            <span>{this.props.commentaire.titre}</span>
                        </div>
                        }
                        <div className="texte">
                            <span className={!this.props.commentaire.texte ? 'missing' : ''}>
                                {this.props.commentaire.texte || 'Si vous souhaitez écrire un commentaire, cliquer sur annuler.'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Summary;
