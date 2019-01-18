import React from 'react';
import PropTypes from 'prop-types';
import { publishAvis } from '../../../../../../../lib/avisService';
import './PublishButton.scss';

export default class PublishButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string,
        label: PropTypes.string,
        beforePublish: PropTypes.func,
    };

    publish = async qualification => {
        let { avis } = this.props;

        if (this.props.beforePublish) {
            await this.props.beforePublish(avis);
        }
        let updated = publishAvis(avis._id, qualification);
        this.props.onChange(updated);
    };

    render() {

        return (
            <div className="PublishButton btn-group">
                <button
                    type="button"
                    className={`btn btn-sm dropdown-toggle ${this.props.buttonClassName || ''}`}
                    data-toggle="dropdown">
                    <i className="far fa-check-circle" /> {this.props.label}
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
        );
    }
}
