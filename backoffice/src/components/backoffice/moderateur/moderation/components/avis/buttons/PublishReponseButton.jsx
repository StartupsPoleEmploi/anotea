import React from 'react';
import PropTypes from 'prop-types';
import { publishReponse } from '../../../moderationService';
import Button from '../../../../../common/library/Button';

export default class PublishReponseButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await publishReponse(avis._id);
        this.props.onChange(updated, {
            message: {
                text: 'La réponse a été publiée.',
                type: 'local',
            },
        });
    };

    render() {
        let isPublished = this.props.avis.reponse.status === 'published';
        return (
            <div className="PublishReponseButton">
                <Button size="large" color="green" disabled={isPublished} onClick={this.onClick}>
                    <i className="far fa-check-circle a-icon" />
                </Button>
            </div>
        );
    }
}
