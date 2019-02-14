import React from 'react';
import PropTypes from 'prop-types';
import { updateEditedCourriel } from '../../service/gestionOrganismesService';
import './Edition.scss';

export default class Edition extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        let organisme = this.props.organisme;
        this.state = {
            inputValue: organisme.editedCourriel ? organisme.editedCourriel : '',
        };
    }

    update = async () => {
        let updated = await updateEditedCourriel(this.props.organisme._id, this.state.inputValue);
        this.props.onClose();
        this.props.onChange(updated, {
            message: { title: 'Email', text: 'L\'adresse email a été mise à jour' }
        });
    };

    render() {
        return (
            <div className="Edition">
                <input
                    type="text"
                    className="form-control"
                    onChange={e => this.setState({ inputValue: e.target.value })}
                    value={this.state.inputValue} />

                <div className="mt-1 pt-0 d-flex justify-content-end">
                    <button type="button" className="cancel" onClick={this.props.onClose}>
                        <i className={`far fa-times-circle`} /> Annuler
                    </button>

                    <button type="button" className="confirm" onClick={this.update}>
                        <i className={`far fa-times-circle`} /> Valider
                    </button>

                </div>
            </div>
        );
    }
}
