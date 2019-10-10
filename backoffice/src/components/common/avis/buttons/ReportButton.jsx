import React from 'react';
import PropTypes from 'prop-types';
import { reportAvis } from '../../../../services/avisService';
import Button from '../../Button';
import Modal from '../../Modal';

export default class ReportButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        showModal: false,
    };

    report = async () => {
        this.setState({ showModal: false });
        let updated = await reportAvis(this.props.avis._id, true);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                color: 'red',
                text: <span>L&apos;avis a été <b>signalé</b>.</span>,
                timeout: 2500,
            }
        });
    };

    unreport = async () => {
        this.setState({ showModal: false });
        let updated = await reportAvis(this.props.avis._id, false);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                color: 'red',
                text: <span>Le signalement a été <b>annulé</b>.</span>,
                timeout: 2500,
            }
        });
    };


    handleCancel = () => {
        this.setState({ showModal: false });
    };

    getModal = () => {
        return (
            <Modal
                title={`Signaler cet avis`}
                body={
                    <span>
                      Signaler un avis permet d'alerter le modérateur sur son non-respect potentiel de la charte de modération
                    </span>
                }
                onClose={this.handleCancel}
                onConfirmed={() => this.report()} />
        );
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="ReportButton">
                {this.state.showModal && this.getModal()}
                <Button size="large" color="red" tooltip="Rejeter" onClick={() => {
                    if (avis.reported) {
                        return this.unreport();
                    }
                    return this.setState({ showModal: true });
                }}>
                    <i className={`far ${avis.reported ? 'fa-bell-slash' : 'fa-bell'} a-icon`} />
                </Button>
            </div>
        );
    }
}
