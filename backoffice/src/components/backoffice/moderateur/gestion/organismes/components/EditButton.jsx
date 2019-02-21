import React from 'react';
import PropTypes from 'prop-types';
import { removeEditedCourriel, resendEmailAccount } from '../../gestionOrganismesService';
import Button from '../../../../common/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../../../common/Dropdown';

export default class EditButton extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
    };

    resend = async () => {
        let updated = await resendEmailAccount(this.props.organisme._id);
        this.props.onChange(updated, {
            message: { text: 'Email envoyé avec succès.', global: true }
        });
    };

    remove = async () => {
        let updated = await removeEditedCourriel(this.props.organisme._id);
        this.props.onChange(updated);
    };

    render() {
        return (
            <div className="EditButton">
                <Dropdown
                    header="Modifier ou supprimer"
                    button={
                        <Button size="large" color="blue" toggable={true}>
                            <i className="fa fa-pencil-alt" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={this.props.onEdit}>
                                <i className="far fa-edit a-icon" /> Modifier l&apos;adresse
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={this.resend}>
                                <i className="far fa-envelope a-icon" /> Renvoyer le lien
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={this.remove} className="a-text-important">
                                <i className="far fa-trash-alt a-icon" /> Supprimer l&apos;adresse
                            </DropdownItem>
                        </div>
                    }
                />
            </div>
        );
    }
}
