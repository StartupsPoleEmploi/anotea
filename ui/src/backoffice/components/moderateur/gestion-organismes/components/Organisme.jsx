import React from 'react';
import PropTypes from 'prop-types';
import './Organisme.scss';
import EditButton from './buttons/EditButton';
import Edition from './buttons/Edition';

export default class Organisme extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        index: PropTypes.object.isRequired,
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
        let { organisme, index, onChange } = this.props;

        let isInactive = organisme.status === 'inactive';
        /*
        nbAvisResponsable: 10
        nbAvisResponsablePasFormateur: 10
        nbAvisResponsablePasFormateurSiretExact: 10
        nbAvisSirenFormateur: 0
        */
        let isResponsable = organisme.nbAvisResponsablePasFormateurSiretExact > 0;
        let isFormateur = organisme.score?.nb_avis > 0;

        return (
            <tr className="Organisme row">
                <h2 className="sr-only">Organisme {index}</h2>
                <td className="col-sm-2 offset-md-1 style-col">
                    <p className="raison-sociale">{organisme.raison_sociale}</p>
                    <p className="siret">{organisme.siret}</p>
                </td>

                <td className="col-2">
                    <p className="type">
                        {(isResponsable && isFormateur) ? 'Dispensateur et responsable' : ''}
                        {(!isResponsable && isFormateur) ? 'Dispensateur' : ''}
                        {(isResponsable && !isFormateur) ? 'Responsable' : ''}
                        {(!isResponsable && !isFormateur) ? `Pas encore d'avis` : ''}
                    </p>
                </td>

                <td className="col-2">
                    <p className={`status ${isInactive ? 'inactive' : ''}`}>
                        {isInactive ? 'Inactif' : 'Compte activé'}
                    </p>
                </td>

                <td className="col-1">
                    <p className="score">{(organisme.score?.nb_avis ? organisme.score.nb_avis : 0) + (organisme.nbAvisResponsablePasFormateurSiretExact ? organisme.nbAvisResponsablePasFormateurSiretExact : 0)}</p>
                </td>

                {this.state.showEdition &&
                <td className="col-4">
                    <Edition organisme={organisme} onChange={onChange} onClose={this.toggleEdition} />
                </td>
                }

                {!this.state.showEdition &&
                <td className="col-xs-8 col-sm-4 col-md-3">
                    <p className="email">
                        {organisme.courriel}
                    </p>
                </td>
                }

                {!this.state.showEdition &&
                <td className="col-sm-2 col-md-1">
                    <div className="btn-group-vertical">
                        <EditButton organisme={organisme} index={index} onChange={onChange} onEdit={this.toggleEdition} />
                    </div>
                </td>
                }
            </tr>
        );
    }
}
