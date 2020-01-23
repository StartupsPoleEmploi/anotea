import React from 'react';
import PropTypes from 'prop-types';
import { editAvis, validateAvis } from '../../../services/avisService';
import Button from '../../../../common/components/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '../Dropdown';

export default class CommentaireEditor extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.reference = React.createRef();
        let avis = this.props.avis;
        this.state = {
            text: avis.commentaire.text,
        };
    }

    componentDidMount() {
        this.reference.current.focus();
    }

    validate = async qualification => {
        await editAvis(this.props.avis._id, this.state.text);
        let updated = await validateAvis(this.props.avis._id, qualification);
        this.props.onClose();
        this.props.onChange(updated, {
            message: {
                text: <span>L&apos;avis a été <b>validé</b> et taggué comme <b>{updated.qualification}</b>.</span>,
                type: 'local',
            },
        });
    };

    render() {
        return (
            <div className="CommentaireEditor">
                <textarea
                    ref={this.reference}
                    className="form-control"
                    rows="4"
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
                                <DropdownItem onClick={() => this.validate('négatif')}>
                                    <i className="far fa-thumbs-down icon" /> Négatif
                                </DropdownItem>
                                <DropdownDivider />
                                <DropdownItem onClick={() => this.validate('positif')}>
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
