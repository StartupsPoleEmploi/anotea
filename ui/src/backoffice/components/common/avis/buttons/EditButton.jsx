import React from 'react';
import PropTypes from 'prop-types';
import { deleteAvis } from '../../../../services/avisService';
import Modal from '../../../../../common/components/Modal';
import Button from '../../../../../common/components/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../Dropdown';

export default class EditButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        index: PropTypes.object.isRequired,
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
                            type: 'local',
                            color: 'red',
                            text: 'L\'avis a été supprimé.',
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
                    try {
                        await deleteAvis(this.props.avis._id, { sendEmail: true });
                    } catch(e) {
                        const messageJson = (await e.json).message;
                        await this.props.onChange(this.props.avis, {
                            message: {
                                text: !messageJson ? e.message : messageJson,
                                color: 'red',
                                type: 'local',
                            }
                        });
                    }
                    await this.props.onChange(this.props.avis, {
                        message: {
                            text: 'Le questionnaire a bien été envoyé au stagiaire.',
                            type: 'local',
                        }
                    });
                    this.setState({ showModal: 'none' });
                }} />
        );
    };

    render() {
        let buttonText = (
            <span className="sr-only">
                éditer le commentaire {this.props.index}
            </span>
        );
        return (
            <div className="EditButton">
                {this.state.showModal === 'resend' && this.getResendModal()}
                {this.state.showModal === 'delete' && this.getDeleteModal()}
                <Dropdown
                    header="Edition"
                    button={
                        <Button size="large" color="blue" toggable={true}>
                            {buttonText}<span aria-hidden="true" className="fa fa-pencil-alt" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={this.props.onEdit}>
                                <span aria-hidden="true" className="far fa-edit a-icon" /> Modifier le contenu
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.showModal('resend')}>
                                <span aria-hidden="true" className="far fa-envelope a-icon" /> Renvoyer le questionnaire
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.showModal('delete')} className="a-text-important">
                                <span aria-hidden="true" className="far fa-trash-alt a-icon" /> Supprimer définitivement
                            </DropdownItem>
                        </div>
                    }
                />
            </div>
        );
    }
}
