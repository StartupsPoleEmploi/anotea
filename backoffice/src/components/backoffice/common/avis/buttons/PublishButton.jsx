import React from 'react';
import PropTypes from 'prop-types';
import { publishAvis } from '../../../avisService';
import Button from '../../Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../Dropdown';

export default class PublishButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    publish = async qualification => {
        let { avis } = this.props;

        let updated = await publishAvis(avis._id, qualification);
        this.props.onChange(updated, {
            message: {
                text: <span>L&apos;avis a été <b>publié</b> et taggué comme <b>{updated.qualification}</b>.</span>,
                type: avis.published ? 'global' : 'local',
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
                            <DropdownItem onClick={() => this.publish('négatif')}>
                                <i className="far fa-thumbs-down a-icon" /> Négatif
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem onClick={() => this.publish('positif')}>
                                <i className="far fa-thumbs-up a-icon" /> Positif ou neutre
                            </DropdownItem>
                        </div>
                    }
                />

            </div>
        );
    }
}
