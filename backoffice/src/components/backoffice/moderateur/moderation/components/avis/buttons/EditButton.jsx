import React from 'react';
import PropTypes from 'prop-types';
import { deleteAvis, resendEmail } from '../../../moderationService';
import Modal from '../../../../../common/Modal';

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
            <div className="EditButton a-dropdown-large btn-group">
                {this.state.showModal === 'resend' && this.getResendModal()}
                {this.state.showModal === 'delete' && this.getDeleteModal()}
                <button
                    type="button"
                    className="a-btn-edit dropdown-toggle"
                    data-toggle="dropdown">
                    <i className="fa fa-pencil-alt" />
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                    <h6 className="dropdown-header">Modifier ou supprimer</h6>
                    <a className="dropdown-item" onClick={this.props.onEdit}>
                        <i className="far fa-edit a-icon" /> Modifier le contenu
                    </a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.showModal('resend')}>
                        <i className="far fa-envelope a-icon" /> Renvoyer le questionnaire
                    </a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item delete" onClick={() => this.showModal('delete')}>
                        <i className="far fa-trash-alt a-icon" /> Supprimer définitivement
                    </a>
                </div>
            </div>
        );
    }
}
