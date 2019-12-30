import React from 'react';
import PropTypes from 'prop-types';
import { publishReponse } from '../../../../services/avisService';
import Button from '../../../../../common/components/Button';

export default class ValidateReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await publishReponse(avis._id);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                text: 'La réponse a été validée.',
            },
        });
    };

    render() {
        let isValidated = this.props.avis.reponse.status === 'validated';
        return (
            <div className="PublishReponseButton">
                <Button size="large" color="green" disabled={isValidated} onClick={this.onClick}>
                    <i className="far fa-check-circle a-icon" />
                </Button>
            </div>
        );
    }
}
