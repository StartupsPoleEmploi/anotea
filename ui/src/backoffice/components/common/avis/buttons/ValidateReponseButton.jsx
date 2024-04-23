import React from 'react';
import PropTypes from 'prop-types';
import { validateReponse } from '../../../../services/avisService';
import Button from '../../../../../common/components/Button';

export default class ValidateReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        index: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await validateReponse(avis._id);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                text: 'La réponse a été validée.',
            },
        });
    };

    render() {
        let isValidated = this.props.avis.reponse.status === 'validated';
        let buttonText = (
            <span className="sr-only">
                Valider le commentaire {this.props.index}
            </span>
        );
        return (
            <div className="PublishReponseButton">
                <Button size="large" color="green" disabled={isValidated} onClick={this.onClick}>
                    {buttonText}<i className="far fa-check-circle a-icon" />
                </Button>
            </div>
        );
    }
}
