import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './Notes.scss';
import help from './images/help.png';

export default class Notes extends Component {

    state = {
        tootlipAccueil: false,
        tooltipAccompagnement: false
    }

    static propTypes = {
        notes: PropTypes.object.isRequired,
    };

    toggleTooltip = tooltip => this.setState(Object.assign(this.state, tooltip));

    render() {

        let { notes } = this.props;

        return (
            <div className="Notes d-flex flex-column">
                <div className="d-flex">
                    <div className="name">Accueil <img src={help} className="help" onMouseEnter={this.toggleTooltip.bind(this, { tootlipAccueil: true })} onMouseLeave={this.toggleTooltip.bind(this, { tootlipAccueil: false })} /></div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.accueil} />
                    </div>
                </div>

                { this.state.tootlipAccueil &&
                    <div>
                        <div className="triangle"></div>
                        <div className="widget-tooltip">
                            Réunions d'information collective et entretiens à l'entrée en formation.
                        </div>
                    </div>
                }

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
                    <div className="name">Accompagnement <img src={help} className="help" onMouseEnter={this.toggleTooltip.bind(this, { tooltipAccompagnement: true })} onMouseLeave={this.toggleTooltip.bind(this, { tooltipAccompagnement: false })} /></div>
                    <div className="star ml-auto align-self-center">
                        <Stars note={notes.accompagnement} />
                    </div>
                </div>

                { this.state.tooltipAccompagnement &&
                    <div>
                        <div className="triangle accompagnement"></div>
                        <div className="widget-tooltip">
                            Aide à la recherche de stage/emploi, mise en relation et rencontre avec les entreprises.
                        </div>
                    </div>
                }
            </div>
        );
    }
}
