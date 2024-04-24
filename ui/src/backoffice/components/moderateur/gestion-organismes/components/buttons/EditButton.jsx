import React from 'react';
import PropTypes from 'prop-types';
import { resendEmailAccount } from '../../gestionOrganismesService';
import Button from '../../../../../../common/components/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../../../common/Dropdown';

export default class EditButton extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        index: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
    };

    resend = async () => {
        let updated = await resendEmailAccount(this.props.organisme._id);
        this.props.onChange(updated, {
            message: {
                text: 'Email envoyé avec succès.',
            }
        });
    };

    render() {
        let buttonText = (
            <span className="sr-only">
                Modifier ou supprimer {this.props.index}
            </span>
        );
        return (
            <div className="EditButton">
                <Dropdown
                    header="Modifier ou supprimer"
                    button={
                        <Button size="large" color="blue" toggable={true}>
                            {buttonText}<i className="fa fa-pencil-alt" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={this.props.onEdit}>
                                <i className="far fa-edit a-icon" /> Modifier l&apos;adresse
                            </DropdownItem>
                            <DropdownDivider />
                            {this.props.organisme.courriel &&
                            <DropdownItem onClick={this.resend}>
                                <i className="far fa-envelope a-icon" /> Renvoyer le lien
                            </DropdownItem>
                            }
                        </div>
                    }
                />
            </div>
        );
    }
}
