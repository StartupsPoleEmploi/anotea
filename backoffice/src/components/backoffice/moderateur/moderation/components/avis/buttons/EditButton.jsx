import React from 'react';
import PropTypes from 'prop-types';
import { deleteAvis, resendEmail } from '../../../moderationService';
import Modal from '../../../../../common/Modal';
import Button from '../../../../../common/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../../../../common/Dropdown';

export default class EditButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showModal: 'none',
        };
    }

    handleCancel = () => {
        this.setState({ showModal: 'none' });
    };

    showModal = actionName => {
        this.setState({ showModal: actionName });
    };

    getDeleteModal = () => {
        let message = {
            title: 'Supprimer définitivement cet avis',
            text: (
                <span>
                Cette action entrainera la <b>suppression</b> de l&apos;avis déposé, <b>confirmez-vous votre demande ?</b>
                </span>
            )
        };

        return (
            <Modal
                message={message}
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    let message = { title: 'Avis supprimé', text: 'L\'avis a été supprimé.' };
                    await deleteAvis(this.props.avis._id);
                    await this.props.onChange(this.props.avis, { message });
                    this.setState({ showModal: 'none' });
                }} />
        );
    };

    getResendModal = () => {
        let message = {
            title: 'Renvoyer le questionnaire au stagiaire',
            text: (
                <span>
                Cette action entrainera la suppression de l&apos;avis déposé, <b>confirmez-vous votre demande ?</b>
                </span>
            )
        };

        return (
            <Modal
                message={message}
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    let message = {
                        title: 'Questionnaire envoyé',
                        text: 'Le questionnaire a bien été envoyé au stagiaire.'
                    };
                    await resendEmail(this.props.avis._id);
                    await this.props.onChange(this.props.avis, { message });
                    this.setState({ showModal: 'none' });
                }} />
        );
    };

    render() {
        return (
            <div className="EditButton">
                {this.state.showModal === 'resend' && this.getResendModal()}
                {this.state.showModal === 'delete' && this.getDeleteModal()}
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
                                <i className="far fa-edit a-icon" /> Modifier le contenu
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.showModal('resend')}>
                                <i className="far fa-envelope a-icon" /> Renvoyer le questionnaire
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.showModal('delete')} className="a-text-important">
                                <i className="far fa-trash-alt a-icon" /> Supprimer définitivement
                            </DropdownItem>
                        </div>
                    }
                />
            </div>
        );
    }
}
