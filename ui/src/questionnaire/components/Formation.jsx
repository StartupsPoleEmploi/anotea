import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './formation.scss';

class Formation extends Component {

    static propTypes = {
        stagiaire: PropTypes.object
    };

    render() {
        let debut = moment(this.props.stagiaire.formation.action.session.periode.debut).format('DD/MM/YYYY');
        let fin = moment(this.props.stagiaire.formation.action.session.periode.fin).format('DD/MM/YYYY');
        return (
            <div className="formation">
                <div className="row pb-5">
                    <div className="col-sm-12 offset-md-1 col-md-10 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        {this.props.stagiaire &&
                        <div>
                            <h1>Évaluez votre formation</h1>
                            <div>
                                <div className="description">
                                    <span className="title">{this.props.stagiaire.formation.intitule}</span>
                                    <span>&nbsp;| {debut} au {fin}</span>
                                    <div>
                                        {this.props.stagiaire.formation.action.organisme_formateur.raison_sociale}
                                        &nbsp;-&nbsp;
                                        {this.props.stagiaire.formation.action.lieu_de_formation.ville}
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Formation;
