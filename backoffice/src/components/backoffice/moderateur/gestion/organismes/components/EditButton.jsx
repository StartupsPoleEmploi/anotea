import React from 'react';
import PropTypes from 'prop-types';
import { removeEditedCourriel, resendEmailAccount } from '../../gestionOrganismesService';

export default class EditButton extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
    };

    resend = async () => {
        let updated = await resendEmailAccount(this.props.organisme._id);
        this.props.onChange(updated, {
            message: { title: 'Email', text: 'Email envoyé avec succès.' }
        });
    };

    remove = async () => {
        let updated = await removeEditedCourriel(this.props.organisme._id);
        this.props.onChange(updated);
    };

    render() {
        return (
            <div className="EditButton">
                <div className="a-dropdown-large btn-group">
                    <button
                        type="button"
                        className="a-btn-edit dropdown-toggle"
                        data-toggle="dropdown">
                        <i className="fa fa-pencil-alt" />
                    </button>
                    <div className="dropdown-menu dropdown-menu-right">
                        <h6 className="dropdown-header">Modifier ou supprimer</h6>
                        <a className="dropdown-item" onClick={this.props.onEdit}>
                            <i className="far fa-edit icon" /> Modifier l&apos;adresse
                        </a>
                        <div className="dropdown-divider" />
                        <a className="dropdown-item" onClick={this.resend}>
                            <i className="far fa-envelope icon" /> Renvoyer le lien
                        </a>
                        <div className="dropdown-divider" />
                        <a className="dropdown-item delete" onClick={this.remove}>
                            <i className="far fa-trash-alt icon" /> Supprimer l&apos;adresse
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
