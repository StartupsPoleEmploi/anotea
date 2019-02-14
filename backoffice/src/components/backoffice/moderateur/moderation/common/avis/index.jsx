import React from 'react';
import PropTypes from 'prop-types';
import Stagiaire from './Stagiaire';
import Titre from './Titre';
import Commentaire from './Commentaire';
import Organisme from './Organisme';
import Edition from './Edition';
import Notes from './Notes';
import Reponse from './Reponse';
import PublishReponseButton from './buttons/PublishReponseButton';
import RejectReponseButton from './buttons/RejectReponseButton';
import PublishButton from './buttons/PublishButton';
import RejectButton from './buttons/RejectButton';
import EditButton from './buttons/EditButton';
import './index.scss';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.object,
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
        let { avis, onChange, options } = this.props;
        let disabled = options.showReponse;

        return (
            <div className="Avis py-3">
                <div className="row">
                    <div className="col-4 py-3 d-none d-sm-block">
                        <Organisme avis={avis} />
                    </div>

                    <div className={`col-7 py-3 ${disabled ? 'disabled' : ''}`}>

                        <div className="mb-3">
                            <Stagiaire
                                avis={avis}
                                showStatus={options.showStatus}
                                disabled={disabled}
                                onChange={onChange} />
                        </div>

                        <div className="mb-1">
                            <Titre avis={avis} disabled={disabled} onChange={onChange} />
                        </div>

                        <div className="mb-1">
                            {this.state.showEdition ?
                                <Edition avis={avis} onChange={onChange} onClose={this.toggleEdition} /> :
                                <Commentaire avis={avis} onChange={onChange} />
                            }
                        </div>

                        <div className="mt-2 d-none d-lg-block">
                            <Notes avis={avis} disabled={disabled} />
                        </div>

                    </div>
                    {
                        !disabled && avis.comment &&
                        <div className="col-1 py-3 pl-0 text-right">
                            <div className="btn-group-vertical">
                                <EditButton avis={avis} onChange={onChange} onEdit={this.toggleEdition} />
                                <PublishButton avis={avis} onChange={onChange} />
                                <RejectButton avis={avis} onChange={onChange} />
                            </div>
                        </div>
                    }
                </div>
                {
                    options.showReponse && avis.reponse &&
                    <div className="row pb-3">
                        <div className="offset-4 col-7 px-0 py-3 ">
                            <Reponse avis={avis} />
                        </div>
                        <div className="col-1 py-3">
                            <div className="btn-group-vertical">
                                <PublishReponseButton avis={avis} onChange={onChange} />
                                <RejectReponseButton avis={avis} onChange={onChange} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
