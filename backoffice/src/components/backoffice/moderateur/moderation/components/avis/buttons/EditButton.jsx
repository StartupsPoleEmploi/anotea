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
        return (
            <Modal
                title="Supprimer définitivement cet avis"
                body={
                    <span>Cette action entrainera la <b>suppression </b> de l&apos;avis déposé, <b>confirmez-vous votre demande ?</b></span>
                }
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    await deleteAvis(this.props.avis._id);
                    await this.props.onChange(this.props.avis, {
                        message: {
                            text: 'L\'avis a été supprimé.',
                            position: 'centered',
                        },
                    });
                    this.setState({ showModal: 'none' });
                }} />
        );
    };

    getResendModal = () => {

        return (
            <Modal
                title="Renvoyer le questionnaire au stagiaire"
                body={
                    <span>Cette action entrainera la suppression de l&apos;avis déposé, <b>confirmez-vous votre demande ?</b></span>
                }
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    await resendEmail(this.props.avis._id);
                    await this.props.onChange(this.props.avis, {
                        message: {
                            text: 'Le questionnaire a bien été envoyé au stagiaire.',
                            position: 'centered',
                        }
                    });
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
