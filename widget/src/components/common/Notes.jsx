import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './Notes.scss';

export default class Notes extends Component {

    static propTypes = {
        notes: PropTypes.object.isRequired,
    };

    render() {

        let { notes } = this.props;

        return (
            <div className="Notes d-flex flex-column">
                <div className="d-flex">
                    <div className="name">Accueil</div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.accueil} />
                    </div>
                </div>
                <div className="d-flex">
                    <div className="name">Contenu</div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.contenu_formation} />
                    </div>
                </div>
                <div className="d-flex">
                    <div className="name">Formateurs</div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.equipe_formateurs} />
                    </div>
                </div>
                <div className="d-flex">
                    <div className="name">Matériels</div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.moyen_materiel} />
                    </div>
                </div>
                <div className="d-flex">
                    <div className="name">Accompagnement</div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.accompagnement} />
                    </div>
                </div>
            </div>
        );
    }
}
