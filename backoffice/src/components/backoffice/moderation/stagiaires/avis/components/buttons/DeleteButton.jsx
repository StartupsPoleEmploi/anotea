import React from 'react';
import PropTypes from 'prop-types';
import { deleteAvis } from '../../../../../../../lib/avisService';
import './DeleteButton.scss';
import Modal from '../../../../../common/Modal';

export default class DeleteButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleDelete = async () => {
        await deleteAvis(this.props.avis._id);
        await this.props.onChange(this.props.avis);
        this.setState({ showModal: false });
    };

    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {
        return (
            <Modal
                title="Supprimer définitivement cet avis"
                text={
                    <span>
                        Cette action entrainera la <b>suppression</b> de l&apos;avis déposé, <b>confirmez-vous votre demande ?</b>
                    </span>
                }
                onConfirmed={this.handleDelete}
                onClose={this.handleCancel} />
        );
    };

    render() {
        return (
            <span className="DeleteButton">
                {this.state.showModal && this.getModal()}
                <button
                    type="button"
                    className="btn"
                    onClick={() => this.setState({ showModal: true })}>
                    <i className="far fa-trash-alt icon" /> <span className="strong">Supprimer</span>
                </button>
            </span>
        );
    }
}
