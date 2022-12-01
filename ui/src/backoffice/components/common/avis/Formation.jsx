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
                <p className="name">{action.organisme_formateur.raison_sociale}&nbsp;&ndash; {action.organisme_formateur.siret}</p>
                { action?.organisme_formateur?.siret && action?.organisme_responsable?.siret &&
                    action.organisme_formateur.siret.substring(0, 9) !== action.organisme_responsable.siret.substring(0, 9) &&
                        <p className="name">{action.organisme_responsable.raison_sociale}&nbsp;&ndash; {action.organisme_responsable.siret}</p> }
                <p>
                    <span>{formation.intitule}</span><br />
                    <span>{formation.numero}</span><br />
                    <span>
                        {action.lieu_de_formation.ville} ({action.lieu_de_formation.code_postal})
                        &nbsp;du <PrettyDate date={new Date(action.session.periode.debut)} format={'L'} />
                        &nbsp;au <PrettyDate date={new Date(action.session.periode.fin)} format={'L'} />
                    </span>
                </p>
            </div>
        );
    }
}
