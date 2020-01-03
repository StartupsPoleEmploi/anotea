import React from "react";
import PropTypes from "prop-types";
import "./Notes.scss";
import Button from "../../../../common/components/Button";
import Star from "../page/panel/results/stats/Star";

const Note = ({ label, note }) => {
    return (
        <div>
            <span>{label}</span>
            <span className="float-right">{note}/5<Star className="pl-1" /></span>
            <br />
        </div>
    );
};
Note.propTypes = { label: PropTypes.string.isRequired, note: PropTypes.number.isRequired };

export default class Notes extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showDetails: !props.avis.comment,
        };
    }

    createNote = (label, note) => {
        return (
            <div className="note">
                <div className="title">{label}</div>
                <div className="text">
                    {note}/5 <Star />
                </div>
            </div>
        );
    };

    toggleDetails = () => {
        this.setState({ showDetails: !this.state.showDetails });
    };

    render() {
        let { avis } = this.props;
        let buttonText = (
            <span className="text">
                Détails des notes <i className={`fas fa-angle-${this.state.showDetails ? "up" : "down"}`} />
            </span>
        );

        return (
            <div className="Notes">
                <Button
                    size="small"
                    color="blue"
                    className="pl-0"
                    onClick={this.toggleDetails}
                    style={{ backgroundColor: "unset" }}>
                    {buttonText}
                </Button>
                {this.state.showDetails &&
                <div className="details d-flex justify-content-between">
                    {this.createNote("Accueil", avis.rates.accueil)}
                    {this.createNote("Contenu", avis.rates.contenu_formation)}
                    {this.createNote("Formateurs", avis.rates.equipe_formateurs)}
                    {this.createNote("Matériels", avis.rates.moyen_materiel)}
                    {this.createNote("Accompagnement", avis.rates.accompagnement)}
                </div>
                }
            </div>
        );
    }
}
