import React from 'react';
import PropTypes from 'prop-types';
import Titre from './Titre';
import Commentaire from './Commentaire';
import Formation from './Formation';
import CommentaireEditor from './CommentaireEditor';
import Notes from './Notes';
import Reponse from './Reponse';
import ValidateReponseButton from './buttons/ValidateReponseButton';
import RejectReponseButton from './buttons/RejectReponseButton';
import ValidateButton from './buttons/ValidateButton';
import RejectButton from './buttons/RejectButton';
import EditButton from './buttons/EditButton';
import LocalMessage from '../message/LocalMessage';
import './Avis.scss';
import MarkAsReadButton from './buttons/MarkAsReadButton';
import ReportButton from './buttons/ReportButton';
import EditReponseButton from './buttons/EditReponseButton';
import ReponseEditor from './ReponseEditor';
import { Workflow } from './Workflow';
import Stars from './Stars';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        showReponse: PropTypes.bool,
        showReponseButtons: PropTypes.bool,
        showModerationButtons: PropTypes.bool,
        showModerationReponseButtons: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        renderWorkflow: PropTypes.func,
    };

    static defaultProps = {
        onChange: () => ({}),
        renderWorkflow: avis => <Workflow avis={avis} />,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            propagateChanges: () => ({}),
            showCommentaireEditor: false,
            showReponseEditor: false,
        };
    }

    toggleCommentairesEditor = async () => {
        this.setState({
            showCommentaireEditor: !this.state.showCommentaireEditor,
        });
    };

    toggleReponseEditor = async () => {
        this.setState({
            showReponseEditor: !this.state.showReponseEditor,
        });
    };

    handleChange = (newAvis, options = {}) => {
        let { message } = options;
        if (message) {
            return new Promise(resolve => {
                this.setState({
                    message,
                    propagateChanges: async () => {
                        await this.props.onChange(newAvis);
                        this.setState({ message: null });
                        resolve();
                    }
                });
            });
        }
        this.props.onChange(newAvis);
    };

    render() {
        let {
            avis, renderWorkflow, showReponse, showReponseButtons,
            showModerationButtons, showModerationReponseButtons,
        } = this.props;
        let { message, showReponseEditor } = this.state;
        let disabledClass = message ? 'disabled' : '';

        return (
            <div className="Avis">

                {message &&
                <LocalMessage message={message} onClose={async () => await this.state.propagateChanges()} />
                }

                <div className="row">
                    <div className={`col-sm-3 offset-md-1 ${disabledClass}`}>
                        <Formation avis={avis} />
                    </div>

                    <div className={`col-sm-7 col-md-6 ${disabledClass}`}>
                        <div className={`${showModerationReponseButtons || showReponseEditor ? 'with-opacity' : ''}`}>
                            <div className="mb-3">
                                <Stars note={avis.rates.global} />
                                {renderWorkflow(avis)}
                            </div>

                            <div className="mb-1">
                                <Titre avis={avis} showModerationButtons={showModerationButtons} onChange={this.handleChange} />
                            </div>

                            <div className="mb-1">
                                {this.state.showCommentaireEditor ?
                                    <CommentaireEditor
                                        avis={avis}
                                        onChange={this.handleChange}
                                        onClose={this.toggleCommentairesEditor} /> :
                                    <Commentaire avis={avis} onChange={this.handleChange} />
                                }
                            </div>

                            <div className="mt-2 d-none d-lg-block">
                                <Notes avis={avis} />
                            </div>
                        </div>
                    </div>
                    {
                        avis.comment && showModerationButtons &&
                        <div className={`col-sm-2 col-md-1 ${disabledClass}`}>
                            <div className="btn-group-vertical">
                                <EditButton avis={avis} onChange={this.handleChange} onEdit={this.toggleCommentairesEditor} />
                                <ValidateButton avis={avis} onChange={this.handleChange} />
                                <RejectButton avis={avis} onChange={this.handleChange} />
                            </div>
                        </div>
                    }
                    {
                        showReponseButtons &&
                        <div className={`col-sm-2 col-md-1 ${disabledClass}`}>
                            <div className="btn-group-vertical">
                                <EditReponseButton avis={avis} onEdit={this.toggleReponseEditor} onChange={this.handleChange} />
                                <MarkAsReadButton avis={avis} onChange={this.handleChange} />
                                <ReportButton avis={avis} onChange={this.handleChange} />
                            </div>
                        </div>
                    }
                </div>
                {this.state.showReponseEditor &&
                <div className="row mt-3">
                    <div className={`offset-sm-3 offset-md-4 col-sm-7 col-md-6 ${disabledClass}`}>
                        <ReponseEditor
                            avis={avis}
                            onChange={this.handleChange}
                            onClose={this.toggleReponseEditor} />
                    </div>
                </div>
                }
                {
                    avis.reponse && showReponse && !this.state.showReponseEditor &&
                    <div className="row mt-3">
                        <div className={`offset-sm-3 offset-md-4 col-sm-7 col-md-6 ${disabledClass}`}>
                            <Reponse avis={avis} />
                        </div>
                        {showModerationReponseButtons &&
                        <div className={`col-sm-2 col-md-1 ${disabledClass}`}>
                            <div className="btn-group-vertical">
                                <ValidateReponseButton avis={avis} onChange={this.handleChange} />
                                <RejectReponseButton avis={avis} onChange={this.handleChange} />
                            </div>
                        </div>
                        }
                    </div>
                }
            </div>

        );
    }
}
