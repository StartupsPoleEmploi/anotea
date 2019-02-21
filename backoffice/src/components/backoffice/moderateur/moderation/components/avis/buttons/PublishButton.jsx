import React from 'react';
import PropTypes from 'prop-types';
import { publishAvis } from '../../../moderationService';

export default class PublishButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    publish = async qualification => {
        let { avis } = this.props;

        let updated = await publishAvis(avis._id, qualification);
        this.props.onChange(updated);
    };

    render() {

        let isPublished = this.props.avis.published;
        return (
            <div className="PublishButton a-dropdown btn-group">
                <button
                    type="button"
                    className={`a-btn-large a-btn-green dropdown-toggle ${isPublished ? 'a-btn-disabled' : ''}`}
                    data-toggle="dropdown">
                    <i className="far fa-check-circle" />
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                    <h6 className="dropdown-header">Valider et tagguer comme</h6>
                    <a className="dropdown-item" onClick={() => this.publish('négatif')}>
                        <i className="far fa-thumbs-down a-icon" /> Négatif
                    </a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.publish('positif')}>
                        <i className="far fa-thumbs-up a-icon" /> Positif ou neutre
                    </a>
                </div>
            </div>
        );
    }
}
