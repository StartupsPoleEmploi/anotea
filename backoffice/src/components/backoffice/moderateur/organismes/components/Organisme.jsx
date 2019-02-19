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
                <div className="offset-md-1 col-3">
                    <p className="title">Nom et SIRET</p>
                    <p className="raison-sociale">{organisme.raisonSociale}</p>
                    <p className="siret">{organisme.meta.siretAsString}</p>
                </div>

                <div className="col-2">
                    <p className="title">Statut</p>
                    <p className={`status ${organisme.activated ? '' : 'inactif'}`}>
                        {organisme.activated ? 'Compte activé' : 'Inactif'}
                    </p>
                </div>

                <div className="col-1">
                    <p className="title">Avis</p>
                    <p className="score">{organisme.score.nb_avis}</p>
                </div>

                <div className="col-3">
                    <p className="title">Contact</p>
                    {!this.state.showEdition ?
                        <p className="email">{organisme.editedCourriel ? organisme.editedCourriel : organisme.courriel}</p> :
                        <Edition
                            organisme={organisme}
                            onChange={onChange}
                            onClose={this.toggleEdition} />
                    }
                </div>

                <div className="col-1">
                    <p className="title"/>
                    <div className="buttons text-center">
                        <EditButton organisme={organisme} onChange={onChange} onEdit={this.toggleEdition} />
                    </div>
                </div>
            </div>
        );
    }
}
