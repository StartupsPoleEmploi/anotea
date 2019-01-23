import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

export default class InjureTagModal extends React.Component {

    render() {
        return (
            <Modal
                isOpen={this.props.modalIsOpen}
                ariaHideApp={false}
                style={customStyles}
            >
                <button className="btn btn-success btn-xs"
                    onClick={this.props.closeModal}>
                    Fermer <i className="far fa-times-circle" />
                </button>
                <h2> Texte à afficher aux modérateurs goes here </h2>
            </Modal>
        );
    }
}
