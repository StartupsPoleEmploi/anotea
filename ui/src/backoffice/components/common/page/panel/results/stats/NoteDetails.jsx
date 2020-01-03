import React from "react";
import PropTypes from "prop-types";
import Star from "./Star";
import "./NoteDetails.scss";

const NoteRepartition = props => {

    let percentage = value => `${Math.round((value / props.total) * 100)}%`;

    return (
        <div className="NoteRepartition">
            <div className="moyenne">
                <div className="label">{props.label}</div>
                <div className="note">
                    <span className="value">{props.note.moyenne}</span>/5<Star />
                </div>
            </div>
            <div className="d-flex flex-column">
                <div className="repartition">
                    <div className="definition">
                        5 <Star />
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note["5"]) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note["5"])}
                    </div>
                </div>
                <div className="repartition">
                    <div className="definition">
                        4 <Star />
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note["4"]) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note["4"])}
                    </div>
                </div>
                <div className="repartition">
                    <div className="definition">
                        3 <Star />
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note["3"]) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note["3"])}
                    </div>
                </div>
                <div className="repartition">
                    <div className="definition">
                        2 <Star />
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note["2"]) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note["2"])}
                    </div>
                </div>
                <div className="repartition">
                    <div className="definition">
                        1 <Star />
                    </div>
                    <div className="gauge">
                        <div className="filler" style={{ width: percentage(props.note["1"]) }}></div>
                    </div>
                    <div className="percentage">
                        {percentage(props.note["1"])}
                    </div>
                </div>
            </div>
        </div>
    );
};

NoteRepartition.propTypes = {
    label: PropTypes.string.isRequired,
    note: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

const NoteGlobale = props => {
    return (
        <div className="NoteGlobale align-self-center">
            <span className="label">Moyenne globale</span>
            <div className="moyenne">
                <div className="note">
                    <span className="value">{props.note.moyenne}</span>/5<Star />
                </div>
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

const NoteDetails = ({ notes, total }) => {

    return (
        <div className="NoteDetails">
            <div className="title">Les notes</div>
            <div className="box d-flex flex-wrap justify-content-between">
                <NoteGlobale note={notes.global} total={total} />
                <NoteRepartition label="Accueil" note={notes.accueil} total={total} />
                <NoteRepartition label="Contenu" note={notes.contenu_formation} total={total} />
                <NoteRepartition label="Formateurs" note={notes.equipe_formateurs} total={total} />
                <NoteRepartition label="Matériels" note={notes.moyen_materiel} total={total} />
                <NoteRepartition label="Accompagnement" note={notes.accompagnement} total={total} />
            </div>
        </div>
    );
};

NoteDetails.propTypes = {
    notes: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
};

export default NoteDetails;
