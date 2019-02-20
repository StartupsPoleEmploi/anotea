import React from 'react';
import PropTypes from 'prop-types';
import { rejectReponse } from '../../../moderationService';

export default class RejectReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await rejectReponse(avis._id);
        this.props.onChange(updated);
    };

    getDisableClass = () => {
        return this.props.avis.reponse.status === 'rejected' ? 'a-btn-disabled' : '';
    };

    render() {
        return (
            <button
                type="button"
                className={`RejectReponseButton a-btn-large a-btn-reject ${this.getDisableClass()}`}
                onClick={this.onClick}>
                <i className="far fa-times-circle" />
            </button>
        );
    }
}
