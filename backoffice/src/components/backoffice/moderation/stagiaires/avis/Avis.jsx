import React from 'react';
import PropTypes from 'prop-types';
import Stagiaire from './components/Stagiaire';
import Titre from './components/Titre';
import Commentaire from './components/Commentaire';
import Organisme from './components/Organisme';
import Edition from './components/Edition';
import Notes from './components/Notes';
import Reponse from './components/Reponse';
import PublishReponseButton from './components/buttons/PublishReponseButton';
import RejectReponseButton from './components/buttons/RejectReponseButton';
import PublishButton from './components/buttons/PublishButton';
import RejectButton from './components/buttons/RejectButton';
import EditButton from './components/buttons/EditButton';
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
                        <div className="col-1 py-3 text-right">
                            <div className="btn-group-vertical">
                                <EditButton avis={avis} onChange={onChange} onEdit={this.toggleEdition} />
                                <PublishButton avis={avis} onChange={onChange} />
                                <RejectButton avis={avis} onChange={onChange} />
                            </div>
                        </div>
                    }
                </div>
                {
                    options.showReponse && avis.answer &&
                    <div className="row pb-3">
                        <div className="offset-4 col-7 px-0 py-3 ">
                            <Reponse reponse={avis.answer} />
                        </div>
                        <div className="col-1 py-3 text-right">
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
