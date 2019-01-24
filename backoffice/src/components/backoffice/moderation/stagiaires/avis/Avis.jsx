import React from 'react';
import PropTypes from 'prop-types';
import Stagiaire from './components/Stagiaire';
import Titre from './components/Titre';
import Commentaire from './components/Commentaire';
import Organisme from './components/Organisme';
import PublishButton from './components/buttons/PublishButton';
import RejectButton from './components/buttons/RejectButton';
import EditButton from './components/buttons/EditButton';
import Edition from './components/Edition';
import Notes from './components/Notes';
import ResendButton from './components/buttons/ResendButton';
import DeleteButton from './components/buttons/DeleteButton';
import './Avis.scss';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        options: PropTypes.object,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showEdition: false,
        };
    }

    toggleEdition = async () => {
        this.setState({
            showEdition: !this.state.showEdition,
        });
    };

    render() {
        let { avis, onChange } = this.props;

        return (
            <div className="Avis card mb-2">
                <div className="card-body">
                    <div className="card-text">
                        <div className="row">

                            <div className="col-4 pl-0 pr-3 border-right d-none d-sm-block">
                                <Organisme avis={avis} />
                            </div>

                            <div className="col-7 pl3">

                                <Stagiaire
                                    className="mb-3"
                                    avis={avis}
                                    onChange={onChange}
                                    showStatus={this.props.options.showStatus} />

                                <Titre avis={avis} onChange={onChange} className="mb-1" />

                                <div className="mb-1">
                                    {this.state.showEdition ?
                                        <Edition avis={avis} onChange={onChange} onClose={this.toggleEdition} /> :
                                        <Commentaire avis={avis} onChange={onChange} />
                                    }
                                </div>

                                <div className="mt-2 d-none d-lg-block">
                                    <Notes avis={avis} />
                                </div>

                            </div>
                            {
                                avis.comment &&
                                <div className="col-1 pr-0">
                                    <div className="btn-group-vertical">
                                        <EditButton onClick={this.toggleEdition} />
                                        <PublishButton avis={avis} onChange={onChange} />
                                        <RejectButton avis={avis} onChange={onChange} />
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="row justify-content-end stagiaire-actions">
                            <div className="col-8 pr-0 mt-3 d-flex justify-content-end">
                                <div className="d-none d-lg-block">
                                    {
                                        this.props.options.showDeleteButton &&
                                        <DeleteButton avis={avis} onChange={onChange} />
                                    }
                                    {
                                        this.props.options.showResendButton &&
                                        <ResendButton avis={avis} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}
