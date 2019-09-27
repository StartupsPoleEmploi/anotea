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
                    <div className="name pr-2">Accueil</div>
                    <Tooltip message="Réunions d'information collective et entretiens à l'entrée en formation." />
                    <div className="star ml-auto">
                        <Stars note={notes.accueil} />
                    </div>
                </div>

                <div className="d-flex align-content-center">
                    <div className="name">Contenu</div>
                    <Tooltip message="Programme, supports pédagogiques, organisation de modules, alternance théorie/pratique." />
                    <div className="star ml-auto">
                        <Stars note={notes.contenu_formation} />
                    </div>
                </div>
                <div className="d-flex align-content-center">
                    <div className="name">Formateurs</div>
                    <Tooltip message="Prise en compte du besoin des stagiaires." />
                    <div className="star ml-auto">
                        <Stars note={notes.equipe_formateurs} />
                    </div>
                </div>
                <div className="d-flex align-content-center">
                    <div className="name">Matériels</div>
                    <Tooltip message="Salles de cours, documentation, plateaux techniques, équipement informatique." />
                    <div className="star ml-auto">
                        <Stars note={notes.moyen_materiel} />
                    </div>
                </div>
                <div className="d-flex align-content-center with-tooltip">
                    <div className="name">Accompagnement</div>
                    <Tooltip message="Aide à la recherche de stage/emploi, mise en relation et rencontre avec les entreprises." />
                    <div className="star ml-auto">
                        <Stars note={notes.accompagnement} />
                    </div>
                </div>
            </div>
        );
    }
}
