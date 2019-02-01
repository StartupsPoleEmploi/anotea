import React from 'react';
import PropTypes from 'prop-types';
import { rejectAvis } from '../../../../../../../lib/avisService';
import './RejectButton.scss';
import Modal from '../../../../../common/Modal';

export default class RejectButton extends React.Component {

    state = {
        showModal: false,
    };

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string,
    };

    reject = async (avis, reason) => {
        let message = {
            title: 'Avis rejeté pour injure',
            text: (<span>L&apos;avis a bien été <b>rejeté</b>, un email a été adressé au stagiaire.</span>)
        };
        this.setState({ showModal: false });
        let updated = await rejectAvis(avis._id, reason);
        this.props.onChange(updated, { message });
    };

    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {

        let message = {
            title: 'Rejeter cet avis pour injure',
            text: (
                <span>
                    Le <b>rejet pour injure</b> entraîne <b>l&apos;envoi d&apos;un email</b> automatique au stagiaire pour l&apos;informer que le <b>commentaire ne sera pas publié</b>. Confirmez-vous cette demande ?
                </span>
            )
        };

        return (
            <Modal
                message={message}
                onConfirmed={() => this.reject(this.props.avis, 'injure')}
                onClose={this.handleCancel} />
        );
    };

    getExtraClasses = () => {
        let classes = this.props.buttonClassName || '';
        return `${classes} ${this.props.avis.rejected ? 'disabled' : ''}`;
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="RejectButton btn-group">
                {this.state.showModal && this.getModal()}
                <button
                    type="button"
                    className={`btn dropdown-toggle ${this.getExtraClasses()}`}
                    data-toggle="dropdown">
                    <i className="far fa-times-circle" />
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                    <h6 className="dropdown-header">Rejeter</h6>
                    <a className="dropdown-item" onClick={() => this.setState({ showModal: true })}>Injure</a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.reject(avis, 'alerte')}>Alerte</a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.reject(avis, 'non concerné')}>
                        Non concerné
                    </a>
                </div>
            </div>
        );
    }
}
