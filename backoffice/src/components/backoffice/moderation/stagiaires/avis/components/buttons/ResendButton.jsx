import React from 'react';
import PropTypes from 'prop-types';
import { resendEmail } from '../../../../../../../lib/avisService';
import './ResendButton.scss';

export default class ResendButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        return (
            <button
                type="button"
                className={`ResendButton`}
                onClick={() => resendEmail(this.props.avis._id)}>
                <i className="far fa-envelope icon" />
                <span className="strong">Renvoyer le questionnaire</span>
            </button>
        );
    }
}
