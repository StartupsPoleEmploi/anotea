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
        this.setState({ showModal: false });
        let updated = await rejectAvis(avis._id, reason);
        this.props.onChange(updated);
    };

     handleCancel = () => {
        this.setState({ showModal: false });
    };

     getModal = () => {
        return (
            <Modal
                title="Rejeter cet avis pour injure"
                text={
                    <span>
                        Le rejet pour Injure entraîne l'envoi d'un mail automatique au stagiaire pour l'informer que le <b>commentaire ne sera pas publié</b>. Il est invité à <b>laisser un nouvel avis</b>. Confirmez-vous cette demande ?
                    </span>
                }
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
                    className={`btn btn-sm dropdown-toggle ${this.getExtraClasses()}`}
                    data-toggle="dropdown">
                    <i className="far fa-times-circle" />
                </button>
                <div className="dropdown-menu">
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
