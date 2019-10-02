import React from 'react';
import PropTypes from 'prop-types';
import { removeReponse } from '../../../../services/avisService';
import Modal from '../../Modal';
import Button from '../../Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../Dropdown';

export default class EditReponseButton extends React.Component {

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
                title="Supprimer définitivement cette réponse"
                body={
                    <span>Cette action entrainera la <b>suppression </b> de la réponse, <b>confirmez-vous votre demande ?</b></span>
                }
                onClose={this.handleCancel}
                onConfirmed={async () => {
                    await removeReponse(this.props.avis._id);
                    await this.props.onChange(this.props.avis, {
                        message: {
                            type: 'local',
                            text: 'La réponse a été supprimée.',
                        },
                    });
                    this.setState({ showModal: 'none' });
                }} />
        );
    };

    render() {
        let { avis, onEdit } = this.props;

        let hasReponse = !!avis.reponse;
        return (
            <div className="EditReponseButton">
                {this.state.showModal === 'delete' && this.getDeleteModal()}
                <Dropdown
                    header="Edition"
                    button={
                        <Button size="large" color="blue" toggable={true}>
                            <i className="fa fa-pencil-alt" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={onEdit}>
                                <i className="far fa-edit a-icon" /> {hasReponse ? 'Modifier la réponse' : 'Répondre'}
                            </DropdownItem>
                            {hasReponse &&
                            <>
                                <DropdownDivider />
                                <DropdownItem onClick={() => this.showModal('delete')} className="a-text-important">
                                    <i className="far fa-trash-alt a-icon" /> Supprimer
                                </DropdownItem>
                            </>
                            }
                        </div>
                    }
                />
            </div>
        );
    }
}
