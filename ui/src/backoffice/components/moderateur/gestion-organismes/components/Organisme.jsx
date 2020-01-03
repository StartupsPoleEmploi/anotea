import React from "react";
import PropTypes from "prop-types";
import "./Organisme.scss";
import EditButton from "./buttons/EditButton";
import Edition from "./buttons/Edition";

export default class Organisme extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showEdition: false,
        };
    }

    toggleEdition = async () => {
        this.setState({
            showEdition: !this.state.showEdition,
        });
    };

    render() {
        let { organisme, onChange } = this.props;

        let isInactive = organisme.status === "inactive";

        return (
            <div className="Organisme row align-items-center">
                <div className="col-sm-3 offset-md-1">
                    <p className="raison-sociale">{organisme.raisonSociale}</p>
                    <p className="siret">{organisme.meta.siretAsString}</p>
                </div>

                <div className="col-2">
                    <p className={`status ${isInactive ? "inactive" : ""}`}>
                        {isInactive ? "Inactif" : "Compte activé"}
                    </p>
                </div>

                <div className="col-1">
                    <p className="score">{organisme.score.nb_avis}</p>
                </div>

                {this.state.showEdition &&
                <div className="col-4">
                    <Edition organisme={organisme} onChange={onChange} onClose={this.toggleEdition} />
                </div>
                }

                {!this.state.showEdition &&
                <div className="col-xs-8 col-sm-4 col-md-3">
                    <p className="email">
                        {organisme.editedCourriel || organisme.kairosCourriel || organisme.courriel}
                    </p>
                </div>
                }

                {!this.state.showEdition &&
                <div className="col-sm-2 col-md-1">
                    <div className="btn-group-vertical">
                        <EditButton organisme={organisme} onChange={onChange} onEdit={this.toggleEdition} />
                    </div>
                </div>
                }
            </div>
        );
    }
}
