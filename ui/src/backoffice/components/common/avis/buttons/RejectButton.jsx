import React from 'react';
import PropTypes from 'prop-types';
import { rejectAvis } from '../../../../services/avisService';
import Modal from '../../../../../common/components/Modal';
import Button from '../../../../../common/components/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../Dropdown';

export default class RejectButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };


    state = {
        showModal: false,
    };

    reject = async (avis, qualification) => {
        this.setState({ showModal: false });
        let updated = await rejectAvis(avis._id, qualification);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                color: 'red',
                text: (
                    <span>
                        L&apos;avis a été <b>rejeté</b> pour le motif <b>{updated.qualification}</b>.
                        {qualification === 'injure' ? ' Un mail a été adressé au stagiaire.' : ''}
                    </span>),
            }
        });
    };

    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {
        return (
            <Modal
                title={`Rejeter cet avis pour ${this.state.qualification}`}
                body={
                    <span>
                        Le <b>rejet pour {this.state.qualification}</b> entraîne <b>l&apos;envoi d&apos;un mail </b> automatique au
                        stagiaire pour l&apos;informer que le <b>commentaire ne sera pas publié</b>. Confirmez-vous
                        cette demande ?
                    </span>
                }
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    try {
                        await this.reject(this.props.avis, this.state.qualification);
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
                }} />
        );
    };

    render() {
        let { avis } = this.props;

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
                            <DropdownItem onClick={() => this.setState({ showModal: true, qualification: 'injure' })}>
                                Injure
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.setState({ showModal: true, qualification: 'alerte' })}>
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
