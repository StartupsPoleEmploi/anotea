import React from 'react';
import PropTypes from 'prop-types';
import { editAvis, publishAvis } from '../../moderationService';

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
        this.props.onChange(updated);
    };

    render() {
        return (
            <div className="Edition">
                <textarea
                    className="form-control"
                    rows="3"
                    onChange={e => this.setState({ text: e.target.value })}
                    value={this.state.text} />

                <div className="py-2 d-flex justify-content-end">
                    <button
                        type="button"
                        className="a-btn-small a-btn-red mr-2"
                        onClick={this.props.onClose}>
                        Annuler
                    </button>

                    <div className="a-dropdown btn-group">
                        <button
                            type="button"
                            className="a-btn-medium a-btn-blue dropdown-toggle"
                            data-toggle="dropdown">
                            Valider et Publier
                        </button>
                        <div className="dropdown-menu">
                            <h6 className="dropdown-header">Valider et tagguer comme</h6>
                            <a className="dropdown-item" onClick={() => this.publish('négatif')}>
                                <i className="far fa-thumbs-down icon" /> Négatif
                            </a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" onClick={() => this.publish('positif')}>
                                <i className="far fa-thumbs-up icon" /> Positif ou neutre
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
