import React from 'react';
import PropTypes from 'prop-types';
import { updateEditedCourriel } from '../gestionOrganismesService';
import Button from '../../../common/library/Button';

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
        const inputValue = this.state.inputValue.replace(/\s/g, '');
        let updated = await updateEditedCourriel(this.props.organisme._id, inputValue);
        this.props.onClose();
        this.props.onChange(updated, {
            message: {
                text: 'L\'adresse mail a été mise à jour',
                position: 'bottom',
            }
        });
    };

    render() {
        return (
            <div className="Edition">
                <input
                    type="text"
                    className="form-control a-text-medium"
                    onChange={e => this.setState({ inputValue: e.target.value })}
                    value={this.state.inputValue} />

                <div className="py-2 d-flex justify-content-end">
                    <Button size="small" color="red" className="mr-2" onClick={this.props.onClose}>
                        Annuler
                    </Button>
                    <Button size="medium" color="blue" onClick={this.update}>
                        Valider
                    </Button>
                </div>
            </div>
        );
    }
}
