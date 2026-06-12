import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './Notes.scss';
import Tooltip from './Tooltip';

export default class Notes extends Component {

    static propTypes = {
        notes: PropTypes.object.isRequired,
    };

    render() {

        let { notes } = this.props;

        return (
            <div className="Notes d-flex flex-column">
                <div className="d-flex align-content-center with-tooltip">
                    <h3 className="name pr-2">Accueil</h3>
                    <Tooltip message="Réunions d'information collective et entretiens à l'entrée en formation." />
                    <p className="star ml-auto">
                        <Stars note={notes.accueil} />
                    </p>
                </div>

                <div className="d-flex align-content-center with-tooltip">
                    <h3 className="name">Contenu</h3>
                    <Tooltip message="Programme, supports pédagogiques, organisation de modules, alternance théorie/pratique." />
                    <p className="star ml-auto">
                        <Stars note={notes.contenu_formation} />
                    </p>
                </div>
                <div className="d-flex align-content-center with-tooltip">
                    <h3 className="name">Formateurs</h3>
                    <Tooltip message="Prise en compte du besoin des stagiaires." />
                    <p className="star ml-auto">
                        <Stars note={notes.equipe_formateurs} />
                    </p>
                </div>
                <div className="d-flex align-content-center with-tooltip">
                    <h3 className="name">Matériels</h3>
                    <Tooltip message="Salles de cours, documentation, plateaux techniques, équipement informatique." />
                    <p className="star ml-auto">
                        <Stars note={notes.moyen_materiel} />
                    </p>
                </div>
                <div className="d-flex align-content-center with-tooltip">
                    <h3 className="name">Accompagnement</h3>
                    <Tooltip message="Aide à la recherche de stage/emploi, mise en relation et rencontre avec les entreprises." />
                    <p className="star ml-auto">
                        <Stars note={notes.accompagnement} />
                    </p>
                </div>
            </div>
        );
    }
}
