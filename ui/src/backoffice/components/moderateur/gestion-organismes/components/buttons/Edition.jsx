import React from 'react';
import PropTypes from 'prop-types';
import { updateEditedCourriel } from '../../gestionOrganismesService';
import Button from '../../../../../../common/components/Button';
import { Select } from '../../../../common/page/form/Form';
import './Edition.scss';

export default class Edition extends React.Component {

    static propTypes = {
        organisme: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            selected: null,
        };
    }

    update = async () => {
        if (this.state.selected) {
            let updated = await updateEditedCourriel(this.props.organisme._id, this.state.selected);
            this.props.onChange(updated, {
                message: {
                    text: 'L\'adresse mail a été mise à jour',
                }
            });
        }
        this.props.onClose();
    };

    getOrganismeEmail = () => {
        let { organisme } = this.props;
        return organisme.editedCourriel || organisme.kairosCourriel || organisme.courriel;
    };

    render() {
        return (
            <div className="Edition">
                <Select
                    value={this.state.selected || this.getOrganismeEmail()}
                    options={this.props.organisme.courriels}
                    loading={false}
                    placeholder={''}
                    isClearable={false}
                    isSearchable={false}
                    onChange={selected => this.setState({ selected })}
                />

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
