import React from 'react';
import PropTypes from 'prop-types';
import Star from '../../../common/page/panel/results/stats/Star';
import './NoteExplications.scss';

const NoteCriteria = props => {
    return (
        <div className="NoteCriteria">
            <div className="moyenne">
                <div className="label">{props.label}</div>
                <div className="note d-flex justify-content-center align-items-center">
                    <span className="value">{props.note.moyenne}</span>/5
                    <Star svg={false} />
                </div>
            </div>
            <div className="d-flex flex-column">
                <div className="explication">
                    Concerne
                    <ul>
                        {
                            props.explications.map((e, index) => {
                                return (<li key={index}>{e}</li>);
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
};

NoteCriteria.propTypes = {
    label: PropTypes.string.isRequired,
    note: PropTypes.object.isRequired,
    explications: PropTypes.array.isRequired,
};

const NoteGlobale = props => {
    return (
        <div className="NoteGlobale d-flex justify-content-start align-items-center">
            <div className="label pr-3">Moyenne globale</div>
            <div className="note d-flex justify-content-between align-items-baseline px-3">
                <div className="d-flex align-items-center pr-3">
                    <span className="value">{props.note.moyenne}</span>/5
                    <Star svg={false} />
                </div>
                <div className="total">{props.total} notes</div>
            </div>
        </div>
    );
};

NoteGlobale.propTypes = {
    note: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

const NoteExplications = ({ notes, total }) => {

    return (
        <div className="NoteExplications">
            <div className="title">Les notes</div>
            <div className="box">
                <NoteGlobale note={notes.global} total={total} />
                <div className="label">Par critères</div>
                <div className="d-flex flex-nowrap justify-content-center">
                    <NoteCriteria label="Accueil" note={notes.accueil} total={total} explications={[
                        'Les réunions d\'informations',
                        'les entretiens à l\'entrée en formation',
                    ]} />
                    <NoteCriteria label="Contenu" note={notes.contenu_formation} total={total} explications={[
                        'Le programme',
                        'Les supports pédagogiques',
                        'L\'organisation des modules',
                        'L\'alertnance théorie / pratique',
                    ]} />
                    <NoteCriteria label="Formateurs" note={notes.equipe_formateurs} total={total} explications={[
                        'L\'équipe de formateurs',
                        'La prise en compte du besoin des stagiaires',
                    ]} />
                    <NoteCriteria label="Matériels" note={notes.moyen_materiel} total={total} explications={[
                        'Les salles de cours',
                        'La documentation',
                        'les plateaux techniques',
                        'L\'équipement informatique',
                    ]} />
                    <NoteCriteria label="Accompagnement" note={notes.accompagnement} total={total} explications={[
                        'L\'aide à la recherche de stage / emploi',
                        'De la mise en relation et rencontre avec les entreprises',
                    ]} />
                </div>
            </div>
        </div>
    );
};

NoteExplications.propTypes = {
    notes: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

export default NoteExplications;
