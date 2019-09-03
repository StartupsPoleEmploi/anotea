import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Stagiaire from './Stagiaire';
import Titre from './Titre';
import Commentaire from './Commentaire';
import Formation from './Formation';
import Edition from './Edition';
import Notes from './Notes';
import Reponse from './Reponse';
import PublishReponseButton from './buttons/PublishReponseButton';
import RejectReponseButton from './buttons/RejectReponseButton';
import PublishButton from './buttons/PublishButton';
import RejectButton from './buttons/RejectButton';
import EditButton from './buttons/EditButton';
import LocalMessage from '../message/LocalMessage';
import './Avis.scss';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        showStatus: PropTypes.bool,
        showReponse: PropTypes.bool,
        readonly: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            propagateChanges: () => ({}),
            showEdition: false,
        };
    }

    toggleEdition = async () => {
        this.setState({
            showEdition: !this.state.showEdition,
        });
    };

    handleChange = (newAvis, options = {}) => {
        let { message } = options;
        if (message && message.type === 'local') {
            this.setState({
                message,
                propagateChanges: () => this.props.onChange(newAvis, _.omit(options, ['message']))
            });
        } else {
            this.props.onChange(newAvis, options);
        }
    };

    render() {
        let { avis, showReponse, showStatus, readonly } = this.props;
        let disabledClass = this.state.message ? 'a-disabled' : '';

        return (
            <div className="Avis">
                {this.state.message &&
                <LocalMessage
                    message={this.state.message}
                    onClose={async () => await this.state.propagateChanges()} />
                }

                <div className="row">
                    <div className={`col-sm-3 offset-md-1 ${disabledClass}`}>
                        <Formation avis={avis} />
                    </div>

                    <div className={`col-sm-7 col-md-6 ${disabledClass}`}>
                        <div className={`${showReponse ? 'with-opacity' : ''}`}>
                            <div className="mb-3">
                                <Stagiaire
                                    avis={avis}
                                    showStatus={showStatus}
                                    readonly={readonly}
                                    onChange={this.handleChange} />
                            </div>

                            <div className="mb-1">
                                <Titre avis={avis} readonly={readonly} onChange={this.handleChange} />
                            </div>

                            <div className="mb-1">
                                {this.state.showEdition ?
                                    <Edition
                                        avis={avis}
                                        onChange={this.handleChange}
                                        onClose={this.toggleEdition} /> :
                                    <Commentaire avis={avis} onChange={this.handleChange} />
                                }
                            </div>

                            <div className="mt-2 d-none d-lg-block">
                                <Notes avis={avis} />
                            </div>
                        </div>
                    </div>
                    {
                        !readonly && avis.comment &&
                        <div className={`col-sm-2 col-md-1 ${disabledClass}`}>
                            <div className="btn-group-vertical">
                                <EditButton avis={avis} onChange={this.handleChange} onEdit={this.toggleEdition} />
                                <PublishButton avis={avis} onChange={this.handleChange} />
                                <RejectButton avis={avis} onChange={this.handleChange} />
                            </div>
                        </div>
                    }
                </div>
                {
                    showReponse && avis.reponse &&
                    <div className="row mt-3">
                        <div className={`offset-sm-3 offset-md-4 col-sm-7 col-md-6 ${disabledClass}`}>
                            <Reponse avis={avis} />
                        </div>
                        <div className={`col-sm-2 col-md-1 ${disabledClass}`}>
                            <div className="btn-group-vertical">
                                <PublishReponseButton avis={avis} onChange={this.handleChange} />
                                <RejectReponseButton avis={avis} onChange={this.handleChange} />
                            </div>
                        </div>
                    </div>
                }
            </div>

        );
    }
}
