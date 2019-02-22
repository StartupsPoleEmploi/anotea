import React from 'react';
import PropTypes from 'prop-types';
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
import Message from '../../../../common/Message';
import './Avis.scss';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            showEdition: false,
        };
    }

    toggleEdition = async () => {
        this.setState({
            showEdition: !this.state.showEdition,
        });
    };

    handleChange = (avis, options = {}) => {
        let { message } = options;
        if (message) {
            this.setState({ message });
        }

        setTimeout(() => {
            this.setState({ message: null }, () => this.props.onChange(avis, options));
        }, 5000);
    };

    render() {
        let { avis, options } = this.props;
        let readonly = options.showReponse;
        let disabledClass = this.state.message && this.state.message.position === 'centered' ? 'disabled' : '';

        return (
            <div className="Avis">
                {this.state.message &&
                <Message
                    message={this.state.message}
                    onClose={() => this.setState({ message: null })} />
                }

                <div className="row">
                    <div className={`col-sm-3 offset-md-1 ${disabledClass}`}>
                        <Formation avis={avis} />
                    </div>

                    <div className={`col-sm-7 col-md-6 ${disabledClass}`}>
                        <div className={`${readonly ? 'readonly' : ''}`}>
                            <div className="mb-3">
                                <Stagiaire
                                    avis={avis}
                                    showStatus={options.showStatus}
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
                                <Notes avis={avis} readonly={readonly} />
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
                    options.showReponse && avis.reponse &&
                    <div className="row mt-3">
                        <div className="offset-sm-3 offset-md-4 col-sm-7 col-md-6">
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
