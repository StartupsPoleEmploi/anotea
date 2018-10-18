import React from 'react';
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

export default class Toolbar extends React.PureComponent {

    state = {
        modalIsOpen: false,
    };


    constructor(props) {
        super(props);
        this.exportOrganisationAdvicesToExcel = props.exportOrganisationAdvicesToExcel;
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    };

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    onclick = () => {
        this.openModal();
        this.exportOrganisationAdvicesToExcel();
    };

    render() {
        const { profile } = this.props;
        return (
            <div className="toolbar">
                {profile === 'financer' &&
                <div className="pull-left">
                    <button className="btn btn-success btn-xs"
                        onClick={this.onclick}>
                        <i className="glyphicon glyphicon glyphicon-download-alt" /> Exporter vers Excel
                    </button>
                    <Modal
                        isOpen={this.state.modalIsOpen}
                        ariaHideApp={false}
                        style={customStyles}
                    >

                        <div className="pull-right">
                            <button className="btn btn-success btn-xs"
                                onClick={this.closeModal}>
                                Fermer <i className="glyphicon glyphicon glyphicon-remove" />
                            </button>
                        </div>
                        <h2> Le téléchargement de votre export excel peut durer quelques secondes.
                            Veuillez patientez... </h2>
                    </Modal>
                </div>
                }
            </div>
        );
    }
}
