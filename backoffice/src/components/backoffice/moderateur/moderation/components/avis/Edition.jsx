import React from 'react';
import PropTypes from 'prop-types';
import { editAvis, publishAvis } from '../../moderationService';
import Button from '../../../../common/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../../../../common/Dropdown';

export default class Edition extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        let avis = this.props.avis;
        this.state = {
            text: avis.editedComment ? avis.editedComment.text : avis.comment.text,
        };
    }

    publish = async qualification => {
        await editAvis(this.props.avis._id, this.state.text);
        let updated = await publishAvis(this.props.avis._id, qualification);
        this.props.onClose();
        this.props.onChange(updated, {
            message: {
                text: <span>L&apos;avis a été <b>publié</b> et taggué comme <b>{updated.qualification}</b>.</span>,
                type: this.props.avis.published ? 'global' : 'local',
            },
        });
    };

    render() {
        return (
            <div className="Edition">
                <textarea
                    className="form-control"
                    rows="3"
                    onChange={e => this.setState({ text: e.target.value })}
                    value={this.state.text} />

                <div className="py-2 text-right">
                    <Button size="small" color="red" className="mr-2" onClick={this.props.onClose}>
                        Annuler
                    </Button>

                    <Dropdown
                        header="Valider et tagguer comme"
                        button={
                            <Button size="medium" color="blue" toggable={true}>
                                Valider et Publier
                            </Button>
                        }
                        items={
                            <div>
                                <DropdownItem onClick={() => this.publish('négatif')}>
                                    <i className="far fa-thumbs-down icon" /> Négatif
                                </DropdownItem>
                                <DropdownDivider />
                                <DropdownItem onClick={() => this.publish('positif')}>
                                    <i className="far fa-thumbs-up icon" /> Positif ou neutre
                                </DropdownItem>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }
}
