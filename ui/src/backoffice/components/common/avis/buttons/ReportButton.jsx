import React from 'react';
import PropTypes from 'prop-types';
import { reportAvis } from '../../../../services/avisService';
import Button from '../../../../../common/components/Button';
import Modal from '../../../../../common/components/Modal';

export default class ReportButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        showModal: false,
        commentReport: null,
    };

    report = async (pCommentReport) => {
        this.setState({ showModal: false });
        let updated = await reportAvis(this.props.avis._id, true, pCommentReport);
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
                    <div>
                        <span>
                            En cliquant sur « signaler », vous considérez que l&apos;avis est contraire aux conditions générales d&apos;utilisation d&apos;Anotéa.
                            Pour un réexamen de l&apos;avis par le modérateur, merci d&apos;indiquer le motif de ce signalement.
                        </span><br/>
                        <textarea
                            name="texte"
                            className="form-control"
                            rows="4"
                            ref={this.reference}
                            value={this.state.commentReport}
                            onChange={e => this.setState({ commentReport: e.target.value })}
                            placeholder="Commentaire sur le signalement."
                        />
                    </div>
              }
                onClose={this.handleCancel}
                onConfirmed={() => this.report(this.state.commentReport)} />
        );
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="ReportButton">
                {this.state.showModal && this.getModal()}
                <Button size="large" color="red" tooltip="Signaler" onClick={() => {
                    if (avis.status === 'reported') {
                        return this.unreport();
                    }
                    return this.setState({ showModal: true });
                }}>
                    <span aria-hidden="true" className={`far ${avis.status === 'reported' ? 'fa-bell-slash' : 'fa-bell'} a-icon`} />
                </Button>
            </div>
        );
    }
}
