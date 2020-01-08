import React from 'react';
import PropTypes from 'prop-types';
import { validateAvis } from '../../../../services/avisService';
import Button from '../../../../../common/components/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../Dropdown';

export default class ValidateButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    validate = async qualification => {
        let { avis } = this.props;

        let updated = await validateAvis(avis._id, qualification);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                text: <span>L&apos;avis a été <b>validé</b> et taggué comme <b>{updated.qualification}</b>.</span>,
            },
        });
    };

    render() {

        return (
            <div className="PublishButton">
                <Dropdown
                    header="Valider et tagguer comme"
                    button={
                        <Button size="large" color="green" toggable={true}>
                            <i className="far fa-check-circle" />
                        </Button>
                    }
                    items={
                        <div>
                            <DropdownItem onClick={() => this.validate('négatif')}>
                                <i className="far fa-thumbs-down a-icon" /> Négatif
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.validate('positif')}>
                                <i className="far fa-thumbs-up a-icon" /> Positif ou neutre
                            </DropdownItem>
                        </div>
                    }
                />

            </div>
        );
    }
}
