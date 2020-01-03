import React from "react";
import PropTypes from "prop-types";
import { markAvisAsRead } from "../../../../services/avisService";
import Button from "../../../../../common/components/Button";

export default class MarkAsReadButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await markAvisAsRead(avis._id, !avis.read);
        this.props.onChange(updated, {
            message: {
                type: "local",
                text: <span>L'avis a été marquée comme<b>{updated.read ? " " : " non "}lue.</b></span>,
            },
        });
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="MarkAsReadButton">
                <Button size="large" color="green" onClick={this.onClick}
                        tooltip={`Marquer comme ${avis.read ? "non lu" : "lu"}`}>
                    <i className={`far ${avis.read ? "fa-eye-slash" : "fa-eye"} a-icon`} />
                </Button>
            </div>
        );
    }
}
