import React from 'react';
import PropTypes from 'prop-types';
import { publishReponse } from '../../../moderationService';

export default class PublishReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await publishReponse(avis._id);
        this.props.onChange(updated);
    };

    getDisableClass = () => {
        return this.props.avis.reponse.status === 'published' ? 'disabled' : '';
    };

    render() {
        return (
            <button
                type="button"
                className={`PublishReponseButton a-btn-large a-btn-green ${this.getDisableClass()}`}
                onClick={this.onClick}>
                <i className="far fa-check-circle a-icon" />
            </button>
        );
    }
}
