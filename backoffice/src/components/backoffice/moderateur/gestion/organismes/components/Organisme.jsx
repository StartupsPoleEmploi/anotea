import React from 'react';
import PropTypes from 'prop-types';
import './Organisme.scss';
import EditButton from './EditButton';
import Edition from './Edition';

export default class Organisme extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
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
        let { organisme, onChange } = this.props;

        return (
            <div className="Organisme row">
                <div className="col-sm-3 offset-md-1">
                    <p className="title d-none d-sm-block">Nom et SIRET</p>
                    <p className="raison-sociale">{organisme.raisonSociale}</p>
                    <p className="siret">{organisme.meta.siretAsString}</p>
                </div>

                <div className="col-2">
                    <p className="title d-none d-sm-block">Statut</p>
                    <p className={`status ${organisme.activated ? '' : 'inactif'}`}>
                        {organisme.activated ? 'Compte activé' : 'Inactif'}
                    </p>
                </div>

                <div className="col-1">
                    <p className="title d-none d-sm-block">Avis</p>
                    <p className="score">{organisme.score.nb_avis}</p>
                </div>

                {this.state.showEdition &&
                <div className="col-4">
                    <p className="title d-none d-sm-block">Contact</p>
                    <Edition organisme={organisme} onChange={onChange} onClose={this.toggleEdition} />
                </div>
                }

                {!this.state.showEdition &&
                <div className="col-xs-8 col-sm-4 col-md-3">
                    <p className="title d-none d-sm-block">Contact</p>
                    <p className="email">
                        {organisme.editedCourriel ? organisme.editedCourriel : organisme.courriel}
                    </p>
                </div>
                }

                {!this.state.showEdition &&
                <div className="col-sm-2 col-md-1">
                    <p className="title d-none d-sm-block">&nbsp;</p>
                    <div className="btn-group-vertical">
                        <EditButton organisme={organisme} onChange={onChange} onEdit={this.toggleEdition} />
                    </div>
                </div>
                }
            </div>
        );
    }
}
