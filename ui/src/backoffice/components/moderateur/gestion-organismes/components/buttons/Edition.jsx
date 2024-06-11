import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
            let updated = await updateCourriel(this.props.organisme._id, this.state.selected);
            this.props.onChange(updated, {
                message: {
                    text: 'L\'adresse mail a été mise à jour',
                }
            });
        }
        this.props.onClose();
    };

    render() {
        let selected = this.state.selected;
        let options = _.uniqBy([...this.props.organisme.courriels, ...(selected ? [{ courriel: selected }] : [])], 'courriel');

        return (
            <div className="Edition">
                <label id="combo-label-add" className="sr-only">Modifier l´adresse email de contact</label>
                <Select
                    type="create"
                    id="combo-label-add"
                    placeholder={'Modifier l´adresse email de contact'}
                    aria-labelledby="combo-label-add"
                    value={selected}
                    options={options}
                    loading={false}
                    optionKey="courriel"
                    optionLabel="courriel"
                    meta={option => option.source}
                    onChange={data => {
                        this.setState({ selected: data ? data.courriel : null });
                    }}
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
