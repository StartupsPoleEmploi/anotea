import React from 'react';
import PropTypes from 'prop-types';
import { updateEditedCourriel } from '../../gestionOrganismesService';

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

                <div className="py-2 d-flex justify-content-end">
                    <button type="button" className="a-btn-cancel" onClick={this.props.onClose}>Annuler</button>

                    <button type="button" className="a-btn-confirm" onClick={this.update}>Valider</button>

                </div>
            </div>
        );
    }
}
