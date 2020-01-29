import React from 'react';
import PropTypes from 'prop-types';
import './Formation.scss';
import PrettyDate from '../PrettyDate';

export default class Formation extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let avis = this.props.avis;
        let formation = avis.formation;
        let action = formation.action;

        return (
            <div className="Formation">
                <p className="name">{action.organisme_formateur.raison_sociale}</p>
                <p>
                    <span>{formation.intitule}</span><br />
                    <span>
                    {action.lieu_de_formation.ville}
                        &nbsp;du <PrettyDate date={new Date(action.session.periode.debut)} numeric={true} />
                        &nbsp;au <PrettyDate date={new Date(action.session.periode.fin)} numeric={true} />
                </span>
                </p>
            </div>
        );
    }
}
