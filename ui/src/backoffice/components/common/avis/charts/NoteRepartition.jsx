import React from 'react';
import PropTypes from 'prop-types';
import Star from '../../page/panel/results/stats/Star';
import './NoteRepartition.scss';

const NoteGauges = props => {

    let percentage = value => `${Math.round((value / props.total) * 100)}%`;

    return (
        <li className="NoteGauges" tabIndex="0">
            <div className="moyenne">
                <div className="label">{props.label}</div>
                <div aria-hidden="true" className="note">
                    <span className="value">{props.note.moyenne}</span>/5<Star />
                </div>
                <p class="sr-only">{props.note.moyenne} sur 5</p>
            </div>
            <ul className="d-flex flex-column no-space">
                <li className="repartition">
                    <div className="definition">
                        5 <Star /><span className="sr-only">étoiles</span>
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note['5']) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note['5'])}
                    </div>
                </li>
                <li className="repartition">
                    <div className="definition">
                        4 <Star /><span className="sr-only">étoiles</span>
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note['4']) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note['4'])}
                    </div>
                </li>
                <li className="repartition">
                    <div className="definition">
                        3 <Star /><span className="sr-only">étoiles</span>
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note['3']) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note['3'])}
                    </div>
                </li>
                <li className="repartition">
                    <div className="definition">
                        2 <Star /><span className="sr-only">étoiles</span>
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note['2']) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note['2'])}
                    </div>
                </li>
                <li className="repartition">
                    <div className="definition">
                        1 <Star /><span className="sr-only">étoile</span>
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note['1']) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note['1'])}
                    </div>
                </li>
            </ul>
        </li>
    );
};

NoteGauges.propTypes = {
    label: PropTypes.string.isRequired,
    note: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

const NoteGlobale = props => {
    return (
        <div className="NoteGlobale align-self-center" tabIndex="0">
            <span className="label">Moyenne globale</span>
            <div className="moyenne">
                <div aria-hidden="true" className="note">
                    <span className="value">{props.note.moyenne}</span>/5<Star />
                </div>
                <p class="sr-only">{props.note.moyenne} sur 5</p>
            </div>
            <div className="total">
                {props.total} notes
            </div>

            <div></div>
        </div>
    );
};

NoteGlobale.propTypes = {
    note: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

const NoteRepartition = ({ notes, total }) => {

    return (
        <div className="NoteRepartition">
            <h2 className="title">Les notes</h2>
            <ul className="box d-flex flex-wrap no-list justify-content-between">
                    <NoteGlobale note={notes.global} total={total} />
                    <NoteGauges label="Accueil" note={notes.accueil} total={total} />
                    <NoteGauges label="Contenu" note={notes.contenu_formation} total={total} />
                    <NoteGauges label="Formateurs" note={notes.equipe_formateurs} total={total} />
                    <NoteGauges label="Matériels" note={notes.moyen_materiel} total={total} />
                    <NoteGauges label="Accompagnement" note={notes.accompagnement} total={total} />
            </ul>
        </div>
    );
};

NoteRepartition.propTypes = {
    notes: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

export default NoteRepartition;
