import React from 'react';
import PropTypes from 'prop-types';
import { editAvis, publishAvis } from '../../moderationService';
import './Edition.scss';

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

                <div className="mt-1 pt-0 d-flex justify-content-end">
                    <button type="button" className="cancel" onClick={this.props.onClose}>
                        <i className={`far fa-times-circle`} /> Annuler
                    </button>

                    <div className="btn-group publish">
                        <button type="button" className={`dropdown-toggle`} data-toggle="dropdown">
                            <i className="far fa-check-circle" /> Valider et Publier
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
