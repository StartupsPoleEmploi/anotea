import React from "react";
import PropTypes from "prop-types";
import { rejectReponse } from "../../../../services/avisService";
import Button from "../../../../../common/components/Button";

export default class RejectReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await rejectReponse(avis._id);
        this.props.onChange(updated, {
            message: {
                type: "local",
                text: "La réponse a été rejetée.",
                color: "red",
                timeout: 2500,
            },
        });
    };

    render() {
        return (
            <div className="RejectReponseButton">
                <Button
                    size="large" color="red" onClick={this.onClick} className="RejectReponseButton"
                    disabled={this.props.avis.reponse.status === "rejected"}>
                    <i className="far fa-times-circle" />
                </Button>
            </div>
        );
    }
}
