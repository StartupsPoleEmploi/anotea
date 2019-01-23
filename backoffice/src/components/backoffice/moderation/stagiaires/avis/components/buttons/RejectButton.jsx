import React from 'react';
import PropTypes from 'prop-types';
import { rejectAvis } from '../../../../../../../lib/avisService';
import './RejectButton.scss';

export default class RejectButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string,
    };

    reject = async (avis, reason) => {
        let updated = await rejectAvis(avis._id, reason);
        this.props.onChange(updated);
    };

    getExtraClasses = () => {
        let classes = this.props.buttonClassName || '';
        return `${classes} ${this.props.avis.rejected ? 'disabled' : ''}`;
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="RejectButton btn-group">
                <button
                    type="button"
                    className={`btn btn-sm dropdown-toggle ${this.getExtraClasses()}`}
                    data-toggle="dropdown">
                    <i className="far fa-times-circle" />
                </button>
                <div className="dropdown-menu">
                    <h6 className="dropdown-header">Rejeter</h6>
                    <a className="dropdown-item" onClick={() => this.reject(avis, 'injure')}>Injure</a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.reject(avis, 'alerte')}>Alerte</a>
                    <div className="dropdown-divider" />
                    <a className="dropdown-item" onClick={() => this.reject(avis, 'non concerné')}>
                        Non concerné
                    </a>
                </div>
            </div>
        );
    }
}
