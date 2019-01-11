import React from 'react';
import PropTypes from 'prop-types';
import { publishAvis } from '../../../../../../../lib/avisService';
import './Button.scss';

export default class PublishButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string.isRequired,
        label: PropTypes.string,
        beforePublish: PropTypes.func,
    };

    publish = async (avis, qualification) => {
        if (this.props.beforePublish) {
            await this.props.beforePublish(avis);
        }
        let updated = publishAvis(avis._id, qualification);
        this.props.onChange(updated);
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="PublishButton Button btn-group">
                <button
                    type="button"
                    className={`btn btn-sm dropdown-toggle ${this.props.buttonClassName}`}
                    data-toggle="dropdown">
                    <i className="far fa-check-circle" /> {this.props.label}
                </button>
                <div className="dropdown-menu">
                    <h6 className="dropdown-header">Valider et tagguer comme</h6>
                    <a className="dropdown-item" onClick={() => this.publish(avis, 'négatif')}>
                        <i className="far fa-thumbs-down icon" /> Négatif
                    </a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.publish(avis, 'positif')}>
                        <i className="far fa-thumbs-up icon" /> Positif ou neutre
                    </a>
                </div>
            </div>
        );
    }
}
