import React from 'react';
import PropTypes from 'prop-types';
import { rejectAvis } from '../../../moderateur/moderation-avis/moderationService';
import Modal from '../../library/Modal';
import Button from '../../library/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../library/Dropdown';

export default class RejectButton extends React.Component {

    state = {
        showModal: false,
    };

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    reject = async (avis, reason) => {
        this.setState({ showModal: false });
        let updated = await rejectAvis(avis._id, reason);
        this.props.onChange(updated, {
            message: {
                text: (
                    <span>
                        L&apos;avis a été <b>rejeté</b> pour le motif <b>{updated.rejectReason}</b>.
                        {reason === 'injure' ? ' Un mail a été adressé au stagiaire.' : ''}
                    </span>),
                type: 'local',
            }
        });
    };

    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {
        return (
            <Modal
                title={`Rejeter cet avis pour ${this.state.reason}`}
                body={
                    <span>
                        Le <b>rejet pour {this.state.reason}</b> entraîne <b>l&apos;envoi d&apos;un mail </b> automatique au
                        stagiaire pour l&apos;informer que le <b>commentaire ne sera pas publié</b>. Confirmez-vous
                        cette demande ?
                    </span>
                }
                onClose={this.handleCancel}
                onConfirmed={() => this.reject(this.props.avis, this.state.reason)} />
        );
    };

    render() {
        let { avis } = this.props;

        let isRejected = !!this.props.avis.rejected;
        return (
            <div className="RejectButton">
                {this.state.showModal && this.getModal()}
                <Dropdown
                    header="Rejeter"
                    button={
                        <Button size="large" color="red" toggable={true}>
                            <i className="far fa-times-circle" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={() => this.setState({ showModal: true, reason: 'injure' })}>
                                Injure
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.setState({ showModal: true, reason: 'alerte' })}>
                                Alerte
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.reject(avis, 'non concerné')}>
                                Non concerné
                            </DropdownItem>
                        </div>
                    }
                />
            </div>
        );
    }
}
