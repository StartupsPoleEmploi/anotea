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
import './Avis.scss';
import Reponse from './components/Reponse';

export default class Avis extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.bool,
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

        return (
            <div className="Avis card mb-2">
                <div className="card-body">
                    <div className="card-text">

                        <div className="row">
                            <div className="col-4 pl-0 pr-3 d-none d-sm-block">
                                <Organisme avis={avis} />
                            </div>

                            <div className="col-7 pl3">

                                <div className="mb-3">
                                    <Stagiaire
                                        avis={avis}
                                        onChange={onChange}
                                        showStatus={options.showStatus} />
                                </div>

                                <div className="mb-1">
                                    <Titre avis={avis} onChange={onChange} />
                                </div>

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
                                        <EditButton avis={avis} onChange={onChange} onEdit={this.toggleEdition} />
                                        <PublishButton avis={avis} onChange={onChange} />
                                        <RejectButton avis={avis} onChange={onChange} />
                                    </div>
                                </div>
                            }
                        </div>
                        {
                            options.showReponse && avis.answer &&
                            <div className="row mt-3">
                                <div className="offset-4 col-7 pl3">
                                    <Reponse reponse={avis.answer} />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
