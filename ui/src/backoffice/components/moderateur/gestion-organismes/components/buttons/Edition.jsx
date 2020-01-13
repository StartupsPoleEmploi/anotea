import React from 'react';
import PropTypes from 'prop-types';
import { updateCourriel } from '../../gestionOrganismesService';
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
            let updated = await updateCourriel(this.props.organisme._id, this.state.selected.courriel);
            this.props.onChange(updated, {
                message: {
                    text: 'L\'adresse mail a été mise à jour',
                }
            });
        }
        this.props.onClose();
    };

    render() {
        return (
            <div className="Edition">
                <Select
                    type={'create'}
                    value={this.state.selected}
                    options={this.props.organisme.courriels}
                    loading={false}
                    placeholder={''}
                    optionKey="courriel"
                    label={option => option.courriel}
                    meta={option => option.source}
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
