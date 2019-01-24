import React from 'react';
import PropTypes from 'prop-types';
import { resendEmail } from '../../../../../../../lib/avisService';
import Modal from '../../../../../common/Modal';
import './ResendButton.scss';

export default class ResendButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleResend = async () => {
        await resendEmail(this.props.avis._id);
        this.setState({ showModal: false });
    };

    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {
        return (
            <Modal
                title="Renvoyer le questionnaire"
                text={<span>Cette action entrainera l&apos;envoi d&apos;un email au stagiaire</span>}
                onConfirmed={this.handleResend}
                onClose={this.handleCancel} />
        );
    };

    render() {
        return (
            <span className="ResendButton">
                {this.state.showModal && this.getModal()}
                <button type="button" className="btn" onClick={() => this.setState({ showModal: true })}>
                    <i className="far fa-envelope icon" />
                    <span className="strong">Renvoyer le questionnaire</span>
                </button>
            </span>
        );
    }
}
